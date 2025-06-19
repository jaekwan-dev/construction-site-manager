import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const katiaCompanies = pgTable('katia_companies', {
  id: serial('id').primaryKey(),
  number: text('number').notNull(),
  companyName: text('company_name').notNull(),
  representative: text('representative').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  linkIdx: text('link_idx'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const trafficAssessments = pgTable('traffic_assessments', {
  id: serial('id').primaryKey(),
  number: text('number').notNull(),
  projectName: text('project_name').notNull(),
  year: text('year').notNull(),
  businessOwner: text('business_owner').notNull(),
  assessmentAgency: text('assessment_agency').notNull(),
  approvalAuthority: text('approval_authority').notNull(),
  location: text('location').notNull(),
  status: text('status').notNull(),
  projectId: text('project_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type KatiaCompany = typeof katiaCompanies.$inferSelect;
export type NewKatiaCompany = typeof katiaCompanies.$inferInsert;
export type TrafficAssessment = typeof trafficAssessments.$inferSelect;
export type NewTrafficAssessment = typeof trafficAssessments.$inferInsert; 