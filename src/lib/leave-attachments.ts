const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024;

const ALLOWED_ATTACHMENT_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_ATTACHMENT_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"];

interface UploadLeaveAttachmentResponse {
  success: boolean;
  message?: string;
  url?: string;
}

export function validateLeaveAttachmentFile(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const hasAllowedExtension = ALLOWED_ATTACHMENT_EXTENSIONS.includes(extension);
  const hasAllowedType =
    !file.type || ALLOWED_ATTACHMENT_TYPES.has(file.type) || hasAllowedExtension;

  if (!hasAllowedType) {
    return "Only PDF, JPG, PNG, or WEBP files are allowed.";
  }

  if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
    return "Attachment must be 5 MB or smaller.";
  }

  return null;
}

export async function uploadLeaveAttachment(file: File): Promise<string> {
  const validationError = validateLeaveAttachmentFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/employee/leave-attachments", {
    method: "POST",
    body: formData,
  });

  const data = (await response.json()) as UploadLeaveAttachmentResponse;

  if (!response.ok || !data.success || !data.url) {
    throw new Error(data.message ?? "Failed to upload attachment");
  }

  return data.url;
}
