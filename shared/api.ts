/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export interface UserDTO {
  _id?: string;
  name: string;
  email: string;
  role: "admin" | "teacher";
}

export interface StudentDTO {
  _id?: string;
  name: string;
  class: string;
  assessments?: AssessmentDTO[];
  remedialPlans?: RemedialPlanDTO[];
}

export interface AssessmentDTO {
  _id?: string;
  studentId: string;
  subject: string;
  score: number;
  date: string;
}

export interface RemedialPlanDTO {
  _id?: string;
  studentId: string;
  planDetails: string;
  assignedBy: string;
  progress: number;
}

export interface ResourceDTO {
  _id?: string;
  title: string;
  description: string;
  method: string;
  uploadedBy: string;
}
