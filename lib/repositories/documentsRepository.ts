import { supabase } from '@/lib/supabase';
import {
  ensureMutation,
  ensureNoError,
  RepositoryError,
  unwrapList,
  unwrapMaybeSingle,
} from '@/lib/adapters/supabaseAdapter';
import { ensureCompanyScope, ensureIdentifier } from '@/lib/middlewares/ensureCompanyScope';
import type {
  Document,
  DocumentCategory,
  DocumentCategoryInsert,
  DocumentCategoryReplace,
  DocumentCategoryUpdate,
  DocumentFile,
  DocumentFileInsert,
  DocumentFileReplace,
  DocumentFileUpdate,
  DocumentInsert,
  DocumentReplace,
  DocumentTemplate,
  DocumentTemplateInsert,
  DocumentTemplateReplace,
  DocumentTemplateUpdate,
  DocumentUpdate,
} from '@/types/db';

export const getDocumentCategories = async (
  companyId: string,
): Promise<DocumentCategory[]> => {
  const response = await supabase
    .from<DocumentCategory>('document_categories')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('created_at', { ascending: true });

  return unwrapList(response, 'Unable to load document categories');
};

export const getDocumentCategoryById = async (
  companyId: string,
  categoryId: string,
): Promise<DocumentCategory> => {
  const response = await supabase
    .from<DocumentCategory>('document_categories')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(categoryId, 'categoryId'))
    .maybeSingle();

  const category = unwrapMaybeSingle(response, 'Unable to load document category');

  if (!category) {
    throw new RepositoryError('Document category not found', { status: 404 });
  }

  return category;
};

export const createDocumentCategory = async (
  companyId: string,
  payload: DocumentCategoryInsert,
): Promise<DocumentCategory> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<DocumentCategory>('document_categories')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create document category');
};

export const replaceDocumentCategory = async (
  companyId: string,
  categoryId: string,
  payload: DocumentCategoryReplace,
): Promise<DocumentCategory> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<DocumentCategory>('document_categories')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(categoryId, 'categoryId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace document category');
};

export const updateDocumentCategory = async (
  companyId: string,
  categoryId: string,
  payload: DocumentCategoryUpdate,
): Promise<DocumentCategory> => {
  const response = await supabase
    .from<DocumentCategory>('document_categories')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(categoryId, 'categoryId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update document category');
};

export const deleteDocumentCategory = async (
  companyId: string,
  categoryId: string,
): Promise<void> => {
  const response = await supabase
    .from('document_categories')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(categoryId, 'categoryId'));

  ensureNoError(response, 'Unable to delete document category');
};

export const getDocumentTemplates = async (
  companyId: string,
): Promise<DocumentTemplate[]> => {
  const response = await supabase
    .from<DocumentTemplate>('document_templates')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('created_at', { ascending: true });

  return unwrapList(response, 'Unable to load document templates');
};

export const getDocumentTemplateById = async (
  companyId: string,
  templateId: string,
): Promise<DocumentTemplate> => {
  const response = await supabase
    .from<DocumentTemplate>('document_templates')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(templateId, 'templateId'))
    .maybeSingle();

  const template = unwrapMaybeSingle(response, 'Unable to load document template');

  if (!template) {
    throw new RepositoryError('Document template not found', { status: 404 });
  }

  return template;
};

export const createDocumentTemplate = async (
  companyId: string,
  payload: DocumentTemplateInsert,
): Promise<DocumentTemplate> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<DocumentTemplate>('document_templates')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create document template');
};

export const replaceDocumentTemplate = async (
  companyId: string,
  templateId: string,
  payload: DocumentTemplateReplace,
): Promise<DocumentTemplate> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<DocumentTemplate>('document_templates')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(templateId, 'templateId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace document template');
};

export const updateDocumentTemplate = async (
  companyId: string,
  templateId: string,
  payload: DocumentTemplateUpdate,
): Promise<DocumentTemplate> => {
  const response = await supabase
    .from<DocumentTemplate>('document_templates')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(templateId, 'templateId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update document template');
};

export const deleteDocumentTemplate = async (
  companyId: string,
  templateId: string,
): Promise<void> => {
  const response = await supabase
    .from('document_templates')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(templateId, 'templateId'));

  ensureNoError(response, 'Unable to delete document template');
};

export const getDocuments = async (
  companyId: string,
): Promise<Document[]> => {
  const response = await supabase
    .from<Document>('documents')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('issued_at', { ascending: false });

  return unwrapList(response, 'Unable to load documents');
};

export const getDocumentById = async (
  companyId: string,
  documentId: string,
): Promise<Document> => {
  const response = await supabase
    .from<Document>('documents')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(documentId, 'documentId'))
    .maybeSingle();

  const document = unwrapMaybeSingle(response, 'Unable to load document');

  if (!document) {
    throw new RepositoryError('Document not found', { status: 404 });
  }

  return document;
};

export const getDocumentsForEmployee = async (
  companyId: string,
  employeeId: string,
): Promise<Document[]> => {
  const response = await supabase
    .from<Document>('documents')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('employee_id', ensureIdentifier(employeeId, 'employeeId'))
    .order('issued_at', { ascending: false });

  return unwrapList(response, 'Unable to load employee documents');
};

export const createDocument = async (
  companyId: string,
  payload: DocumentInsert,
): Promise<Document> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<Document>('documents')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create document');
};

export const replaceDocument = async (
  companyId: string,
  documentId: string,
  payload: DocumentReplace,
): Promise<Document> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<Document>('documents')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(documentId, 'documentId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace document');
};

export const updateDocument = async (
  companyId: string,
  documentId: string,
  payload: DocumentUpdate,
): Promise<Document> => {
  const response = await supabase
    .from<Document>('documents')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(documentId, 'documentId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update document');
};

export const deleteDocument = async (
  companyId: string,
  documentId: string,
): Promise<void> => {
  const response = await supabase
    .from('documents')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(documentId, 'documentId'));

  ensureNoError(response, 'Unable to delete document');
};

export const getDocumentFiles = async (
  companyId: string,
  documentId?: string,
): Promise<DocumentFile[]> => {
  let query = supabase
    .from<DocumentFile>('document_files')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .order('uploaded_at', { ascending: false });

  if (documentId) {
    query = query.eq('document_id', ensureIdentifier(documentId, 'documentId'));
  }

  const response = await query;

  return unwrapList(response, 'Unable to load document files');
};

export const getDocumentFileById = async (
  companyId: string,
  fileId: string,
): Promise<DocumentFile> => {
  const response = await supabase
    .from<DocumentFile>('document_files')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(fileId, 'fileId'))
    .maybeSingle();

  const file = unwrapMaybeSingle(response, 'Unable to load document file');

  if (!file) {
    throw new RepositoryError('Document file not found', { status: 404 });
  }

  return file;
};

export const createDocumentFile = async (
  companyId: string,
  payload: DocumentFileInsert,
): Promise<DocumentFile> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<DocumentFile>('document_files')
    .insert({ ...payload, company_id: scopedCompanyId })
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to create document file');
};

export const replaceDocumentFile = async (
  companyId: string,
  fileId: string,
  payload: DocumentFileReplace,
): Promise<DocumentFile> => {
  const scopedCompanyId = ensureCompanyScope(companyId);
  const response = await supabase
    .from<DocumentFile>('document_files')
    .update({ ...payload, company_id: scopedCompanyId })
    .eq('company_id', scopedCompanyId)
    .eq('id', ensureIdentifier(fileId, 'fileId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to replace document file');
};

export const updateDocumentFile = async (
  companyId: string,
  fileId: string,
  payload: DocumentFileUpdate,
): Promise<DocumentFile> => {
  const response = await supabase
    .from<DocumentFile>('document_files')
    .update(payload)
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(fileId, 'fileId'))
    .select('*')
    .single();

  return ensureMutation(response, 'Unable to update document file');
};

export const deleteDocumentFile = async (
  companyId: string,
  fileId: string,
): Promise<void> => {
  const response = await supabase
    .from('document_files')
    .delete()
    .eq('company_id', ensureCompanyScope(companyId))
    .eq('id', ensureIdentifier(fileId, 'fileId'));

  ensureNoError(response, 'Unable to delete document file');
};

export const getDocumentFilesByDocumentIds = async (
  companyId: string,
  documentIds: string[],
): Promise<DocumentFile[]> => {
  if (!documentIds.length) {
    return [];
  }

  const response = await supabase
    .from<DocumentFile>('document_files')
    .select('*')
    .eq('company_id', ensureCompanyScope(companyId))
    .in('document_id', documentIds)
    .order('version', { ascending: false })
    .order('uploaded_at', { ascending: false });

  return unwrapList(response, 'Unable to load document files');
};
