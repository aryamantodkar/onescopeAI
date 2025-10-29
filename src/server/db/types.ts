import type { InferSelectModel, InferInsertModel } from "drizzle-orm";
import type * as schema from "./schema";
import type { db } from ".";

export type User = InferSelectModel<typeof schema.user>;
export type InsertUser = InferInsertModel<typeof schema.user>;

export type Session = InferSelectModel<typeof schema.session>;
export type InsertSession = InferInsertModel<typeof schema.session>;

export type Account = InferSelectModel<typeof schema.account>;
export type InsertAccount = InferInsertModel<typeof schema.account>;

export type Verification = InferSelectModel<typeof schema.verification>;
export type InsertVerification = InferInsertModel<typeof schema.verification>;

export type Organization = InferSelectModel<typeof schema.organization>;
export type InsertOrganization = InferInsertModel<typeof schema.organization>;

export type Member = InferSelectModel<typeof schema.member>;
export type InsertMember = InferInsertModel<typeof schema.member>;

export type Invitation = InferSelectModel<typeof schema.invitation>;
export type InsertInvitation = InferInsertModel<typeof schema.invitation>;

export type Workspace = InferSelectModel<typeof schema.workspaces>;
export type InsertWorkspace = InferInsertModel<typeof schema.workspaces>;

export type Competitor = { id: string; name: string; website?: string };

export type UserPrompt = {
    id: string;
    user_id: string;
    workspace_id: string;
    prompt: string;
    per_model: Record<
      string,
      {
        sentiment: number;
        position: number;
        visibility: number;
        topFavicons: string[];
      }
    >;
    created_at: string;
  };
  
  // Represents a response to a prompt
  export interface PromptResponse {
    id: string;
    prompt_id: string;
    user_id: string;
    workspace_id: string;
    model: string;
    modelProvider: string;
    response: string;
    citations: Array<{
      title: string;
      url: string;
      start_index?: number | null;
      end_index?: number | null;
      cited_text: string;
    }>;
    sources: Array<{
      title: string;
      url: string;
      page_age?: string | null;
    }>;
    created_at: string;
  }