import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

import { ControllerInput } from '@/components/custom/ControllerInput';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { profileFormSchema, companyFormSchema } from '@/types/screens/settings';
import type { ProfileFormValues, CompanyFormValues } from '@/types/screens/settings';

type CompanyState = {
  id: string;
  name: string;
  companyCode: string;
  countryCode: string;
  defaultTimeZone: string;
  planTier: string;
  description?: string | null;
  industry?: string | null;
  billingEmail?: string | null;
  role?: string;
  status?: string;
};

const PRIMARY_COLOR = '#0C6DD9';

export default function SettingsScreen() {
  const { user, refreshSession } = useAuth();
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [company, setCompany] = useState<CompanyState | null>(null);
  const router = useRouter();
  const canGoBack = router.canGoBack();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: '',
      preferredName: undefined,
      phone: undefined,
      timeZone: 'UTC',
      locale: 'es-AR',
      bio: undefined,
      cuil: undefined,
    },
  });

  const companyForm = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      companyCode: '',
      companyName: undefined,
      countryCode: undefined,
      defaultTimeZone: undefined,
      industry: undefined,
      billingEmail: undefined,
      description: undefined,
    },
  });

  const fullNameFromAuth = useMemo(() => {
    if (!user) {
      return '';
    }
    const parts = [user.firstName, user.lastName].filter(Boolean) as string[];
    return parts.length ? parts.join(' ') : '';
  }, [user]);

  useEffect(() => {
    if (!user?.id) {
      setIsBootstrapping(false);
      return;
    }

    const load = async () => {
      setIsBootstrapping(true);
      try {
        const [
          { data: profileData, error: profileError },
          { data: membershipData, error: membershipError },
        ] = await Promise.all([
          supabase.from('user_profiles').select('*').eq('user_id', user.id).maybeSingle(),
          supabase
            .from('company_members')
            .select(
              'id, status, role, company:companies(id, name, company_code, country_code, default_time_zone, plan_tier, industry, billing_email, metadata)',
            )
            .eq('user_id', user.id)
            .maybeSingle(),
        ]);

        if (profileError) {
          console.warn('[Settings] Failed to load profile', profileError);
        }

        if (membershipError) {
          console.warn('[Settings] Failed to load membership', membershipError);
        }

        const defaults: ProfileFormValues = {
          fullName: profileData?.full_name ?? fullNameFromAuth,
          preferredName: profileData?.preferred_name ?? undefined,
          phone: profileData?.phone ?? undefined,
          timeZone: profileData?.time_zone ?? 'UTC',
          locale: profileData?.locale ?? 'es-AR',
          bio: profileData?.bio ?? undefined,
          cuil: user?.cuil ?? undefined,
        };

        profileForm.reset(defaults);

        if (membershipData?.company) {
          const companyMetadata = (membershipData.company.metadata ?? {}) as Record<
            string,
            unknown
          >;
          const description =
            typeof companyMetadata.description === 'string'
              ? companyMetadata.description
              : undefined;

          const resolvedCompany: CompanyState = {
            id: membershipData.company.id,
            name: membershipData.company.name,
            companyCode: membershipData.company.company_code,
            countryCode: membershipData.company.country_code,
            defaultTimeZone: membershipData.company.default_time_zone,
            planTier: membershipData.company.plan_tier,
            description: description ?? null,
            industry: membershipData.company.industry,
            billingEmail: membershipData.company.billing_email,
            role: membershipData.role ?? undefined,
            status: membershipData.status ?? undefined,
          };

          setCompany(resolvedCompany);
          companyForm.reset({
            companyCode: resolvedCompany.companyCode,
            companyName: resolvedCompany.name,
            countryCode: resolvedCompany.countryCode,
            defaultTimeZone: resolvedCompany.defaultTimeZone,
            industry: resolvedCompany.industry ?? undefined,
            billingEmail: resolvedCompany.billingEmail ?? undefined,
            description: resolvedCompany.description ?? undefined,
          });
        } else {
          setCompany(null);
          companyForm.reset({
            companyCode: '',
            companyName: undefined,
            countryCode: undefined,
            defaultTimeZone: undefined,
            industry: undefined,
            billingEmail: undefined,
            description: undefined,
          });
        }
      } finally {
        setIsBootstrapping(false);
      }
    };

    void load();
  }, [companyForm, profileForm, fullNameFromAuth, user]);

  const onSubmitProfile = profileForm.handleSubmit(async (values) => {
    if (!user?.id) {
      return;
    }

    setIsSavingProfile(true);
    try {
      const normalized = {
        full_name: values.fullName.trim(),
        preferred_name: values.preferredName ?? null,
        phone: values.phone ?? null,
        time_zone: values.timeZone.trim(),
        locale: values.locale.trim(),
        bio: values.bio ?? null,
        user_id: user.id,
        updated_at: new Date().toISOString(),
      };

      const { error: upsertError } = await supabase.from('user_profiles').upsert(normalized, {
        onConflict: 'user_id',
      });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          fullName: values.fullName.trim(),
          preferredName: values.preferredName ?? null,
          phone: values.phone ?? null,
          timeZone: values.timeZone.trim(),
          locale: values.locale.trim(),
          bio: values.bio ?? null,
          cuil: values.cuil ?? null,
        },
      });

      if (updateUserError) {
        throw new Error(updateUserError.message);
      }

      await refreshSession();

      Alert.alert('Perfil actualizado', 'Guardamos tus datos personales.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos guardar los cambios.';
      Alert.alert('Error al guardar', message);
    } finally {
      setIsSavingProfile(false);
    }
  });

  const onSubmitCompany = companyForm.handleSubmit(async (values) => {
    if (!user?.id) {
      return;
    }

    setIsSavingCompany(true);
    try {
      const trimmedCode = values.companyCode.trim().toUpperCase();

      const { data: companyMatch, error: companyFetchError } = await supabase
        .from('companies')
        .select('*')
        .eq('company_code', trimmedCode)
        .maybeSingle();

      if (companyFetchError) {
        throw new Error(companyFetchError.message);
      }

      let resolvedCompany = companyMatch;

      if (!resolvedCompany) {
        if (!values.companyName || !values.countryCode || !values.defaultTimeZone) {
          throw new Error(
            'Para crear una empresa nueva completá el nombre, el país (ISO 3166-1) y el huso horario por defecto.',
          );
        }

        const payload = {
          name: values.companyName,
          company_code: trimmedCode,
          country_code: values.countryCode,
          default_time_zone: values.defaultTimeZone,
          plan_tier: 'trial',
          industry: values.industry ?? null,
          billing_email: values.billingEmail ?? null,
          metadata: values.description ? { description: values.description } : {},
          created_by: user.id,
        };

        const { data: insertedCompany, error: insertError } = await supabase
          .from('companies')
          .insert(payload)
          .select()
          .single();

        if (insertError) {
          throw new Error(insertError.message);
        }

        resolvedCompany = insertedCompany;
      }

      const nowIso = new Date().toISOString();
      const membershipPayload = {
        company_id: resolvedCompany.id,
        user_id: user.id,
        role: 'admin',
        status: 'active',
        invited_at: nowIso,
        joined_at: nowIso,
      };

      const { error: membershipError } = await supabase
        .from('company_members')
        .upsert(membershipPayload, { onConflict: 'company_id,user_id' });

      if (membershipError) {
        throw new Error(membershipError.message);
      }

      const descriptionFromCompany =
        typeof resolvedCompany.metadata?.description === 'string'
          ? resolvedCompany.metadata.description
          : (values.description ?? null);

      const { error: updateUserError } = await supabase.auth.updateUser({
        data: {
          companyName: resolvedCompany.name,
          companyDescription: descriptionFromCompany,
          companyCode: resolvedCompany.company_code,
        },
      });

      if (updateUserError) {
        throw new Error(updateUserError.message);
      }

      await refreshSession();

      setCompany({
        id: resolvedCompany.id,
        name: resolvedCompany.name,
        companyCode: resolvedCompany.company_code,
        countryCode: resolvedCompany.country_code,
        defaultTimeZone: resolvedCompany.default_time_zone,
        planTier: resolvedCompany.plan_tier,
        description: descriptionFromCompany,
        industry: resolvedCompany.industry,
        billingEmail: resolvedCompany.billing_email,
        role: 'admin',
        status: 'active',
      });

      companyForm.reset({
        companyCode: resolvedCompany.company_code,
        companyName: resolvedCompany.name,
        countryCode: resolvedCompany.country_code,
        defaultTimeZone: resolvedCompany.default_time_zone,
        industry: resolvedCompany.industry ?? undefined,
        billingEmail: resolvedCompany.billing_email ?? undefined,
        description: descriptionFromCompany ?? undefined,
      });

      Alert.alert('Empresa vinculada', 'Asociamos tu cuenta a la empresa seleccionada.');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No pudimos vincular tu usuario con la empresa indicada.';
      Alert.alert('Error al vincular empresa', message);
    } finally {
      setIsSavingCompany(false);
    }
  });

  if (isBootstrapping) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-100">
        <ActivityIndicator
          size="large"
          color={PRIMARY_COLOR}
        />
        <Text className="mt-4 text-base text-slate-500">Cargando configuración…</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <ScrollView
        className="flex-1 bg-slate-100"
        contentContainerStyle={{ paddingBottom: 48, paddingTop: 56 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-6">
          <View className="mb-4 flex-row items-center justify-between">
            <Pressable
              accessibilityLabel="Volver"
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-full bg-primary-100"
              android_ripple={{ color: 'rgba(12, 109, 217, 0.2)', borderless: false }}
              onPress={() => {
                if (canGoBack) {
                  router.back();
                } else {
                  router.replace('/(tabs)/(home)');
                }
              }}
            >
              <MaterialIcons
                name="arrow-back"
                size={22}
                color={PRIMARY_COLOR}
              />
            </Pressable>
            <Text className="flex-1 text-center text-lg font-semibold text-slate-900">
              Configuración
            </Text>
            <View className="h-10 w-10" />
          </View>

          <View className="rounded-3xl bg-white p-6">
            <Text className="text-lg font-semibold text-slate-900">Datos personales</Text>
            <Text className="mt-1 text-sm text-slate-500">
              Completá tus datos para personalizar tu experiencia y cumplir con los requisitos del
              área de RRHH.
            </Text>

            <View className="mt-6 gap-4">
              <ControllerInput
                control={profileForm.control}
                name="fullName"
                label="Nombre completo"
                inputProps={{ autoCapitalize: 'words', placeholder: 'Juan Ignacio Pérez' }}
              />
              <ControllerInput
                control={profileForm.control}
                name="preferredName"
                label="Nombre preferido"
                inputProps={{ autoCapitalize: 'words', placeholder: 'Juan' }}
              />
              <ControllerInput
                control={profileForm.control}
                name="phone"
                label="Teléfono"
                keyboardType="phone-pad"
                inputProps={{ placeholder: '+54 9 11 5555 4444' }}
              />
              <ControllerInput
                control={profileForm.control}
                name="timeZone"
                label="Huso horario"
                inputProps={{
                  placeholder: 'America/Argentina/Buenos_Aires',
                  autoCapitalize: 'none',
                }}
              />
              <ControllerInput
                control={profileForm.control}
                name="locale"
                label="Idioma preferido"
                inputProps={{ placeholder: 'es-AR', autoCapitalize: 'none' }}
              />
              <ControllerInput
                control={profileForm.control}
                name="bio"
                label="Bio"
                inputProps={{
                  placeholder: 'Contanos algo sobre vos',
                  multiline: true,
                  numberOfLines: 3,
                }}
              />
              <ControllerInput
                control={profileForm.control}
                name="cuil"
                label="CUIL"
                keyboardType="number-pad"
                inputProps={{ placeholder: '20XXXXXXXXX' }}
              />
            </View>

            <Pressable
              className="mt-6 items-center rounded-2xl bg-primary-600 px-6 py-3"
              disabled={isSavingProfile}
              onPress={() => {
                void onSubmitProfile();
              }}
            >
              {isSavingProfile ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="text-base font-semibold text-white">Guardar datos personales</Text>
              )}
            </Pressable>
          </View>

          <View className="mt-8 rounded-3xl bg-white p-6">
            <Text className="text-lg font-semibold text-slate-900">Empresa</Text>
            <Text className="mt-1 text-sm text-slate-500">
              Ingresá el código de tu empresa para vincular tu usuario o creá la compañía si sos el
              primer administrador.
            </Text>

            {company ? (
              <View className="mt-6 rounded-2xl border border-primary-100 bg-primary-50 p-4">
                <Text className="text-base font-semibold text-primary-800">{company.name}</Text>
                <Text className="mt-1 text-sm text-primary-700">Código: {company.companyCode}</Text>
                <Text className="text-sm text-primary-700">País: {company.countryCode}</Text>
                <Text className="text-sm text-primary-700">
                  Huso horario: {company.defaultTimeZone}
                </Text>
                {company.description ? (
                  <Text className="mt-2 text-sm text-primary-600">{company.description}</Text>
                ) : null}
                <Text className="mt-3 text-xs uppercase text-primary-500">
                  Rol: {company.role ?? 'admin'} • Estado: {company.status ?? 'active'}
                </Text>
              </View>
            ) : null}

            {!company ? (
              <View className="mt-6 gap-4">
                <ControllerInput
                  control={companyForm.control}
                  name="companyCode"
                  label="Código de empresa"
                  inputProps={{ placeholder: 'Ej: WORKFOLIO-AR', autoCapitalize: 'characters' }}
                />
                <ControllerInput
                  control={companyForm.control}
                  name="companyName"
                  label="Nombre de la empresa"
                  inputProps={{ placeholder: 'Workfolio', autoCapitalize: 'words' }}
                />
                <ControllerInput
                  control={companyForm.control}
                  name="countryCode"
                  label="País (ISO 3166-1)"
                  inputProps={{ placeholder: 'AR', autoCapitalize: 'characters' }}
                />
                <ControllerInput
                  control={companyForm.control}
                  name="defaultTimeZone"
                  label="Huso horario por defecto"
                  inputProps={{
                    placeholder: 'America/Argentina/Buenos_Aires',
                    autoCapitalize: 'none',
                  }}
                />
                <ControllerInput
                  control={companyForm.control}
                  name="industry"
                  label="Industria"
                  inputProps={{ placeholder: 'Tecnología', autoCapitalize: 'words' }}
                />
                <ControllerInput
                  control={companyForm.control}
                  name="billingEmail"
                  label="Email de contacto"
                  keyboardType="email-address"
                  inputProps={{ autoCapitalize: 'none', placeholder: 'finance@workfolio.com' }}
                />
                <ControllerInput
                  control={companyForm.control}
                  name="description"
                  label="Descripción"
                  inputProps={{
                    placeholder: 'Descripción breve de la compañía',
                    multiline: true,
                    numberOfLines: 3,
                  }}
                />
              </View>
            ) : null}

            {!company ? (
              <Pressable
                className="mt-6 items-center rounded-2xl bg-primary-600 px-6 py-3"
                disabled={isSavingCompany}
                onPress={() => {
                  void onSubmitCompany();
                }}
              >
                {isSavingCompany ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text className="text-base font-semibold text-white">Vincular empresa</Text>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
