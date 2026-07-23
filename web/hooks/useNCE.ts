"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNCEDashboard,
  getNCENotifications,
  createNCENotification,
  markNCENotificationRead,
  archiveNCENotification,
  getNCETemplates,
  getNCETemplate,
  createNCETemplate,
  updateNCETemplate,
  getNCEPreference,
  updateNCEPreference,
  generateNCEDigest,
  getNCEDigests,
  consumeNCEAUEEvents,
} from "@/services/nce";
import type {
  NCENotificationsParams,
  NCETemplatesParams,
  NCEDigestsParams,
  NCECreateNotificationParams,
  NCECreateTemplateParams,
  NCEUpdateTemplateParams,
  NCEUpdatePreferenceParams,
  NCEMarkReadParams,
  NCEGenerateDigestParams,
} from "@/types/nce";

// ─── Query keys ───────────────────────────────────────────────────────────────

const K = {
  dashboard:     ["nce", "dashboard"] as const,
  notifications: (p?: NCENotificationsParams) => ["nce", "notifications", p] as const,
  templates:     (p?: NCETemplatesParams) => ["nce", "templates", p] as const,
  template:      (id: string) => ["nce", "template", id] as const,
  preference:    (userId: string) => ["nce", "preference", userId] as const,
  digests:       (p?: NCEDigestsParams) => ["nce", "digests", p] as const,
};

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useNCEDashboard() {
  return useQuery({ queryKey: K.dashboard, queryFn: getNCEDashboard });
}

export function useNCENotifications(params?: NCENotificationsParams) {
  return useQuery({
    queryKey: K.notifications(params),
    queryFn:  () => getNCENotifications(params),
  });
}

export function useNCETemplates(params?: NCETemplatesParams) {
  return useQuery({
    queryKey: K.templates(params),
    queryFn:  () => getNCETemplates(params),
  });
}

export function useNCETemplate(id: string) {
  return useQuery({
    queryKey: K.template(id),
    queryFn:  () => getNCETemplate(id),
    enabled:  !!id,
  });
}

export function useNCEPreference(userId: string, userEmail?: string) {
  return useQuery({
    queryKey: K.preference(userId),
    queryFn:  () => getNCEPreference(userId, userEmail),
    enabled:  !!userId,
  });
}

export function useNCEDigests(params?: NCEDigestsParams) {
  return useQuery({
    queryKey: K.digests(params),
    queryFn:  () => getNCEDigests(params),
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateNCENotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: NCECreateNotificationParams) => createNCENotification(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nce", "notifications"] });
      qc.invalidateQueries({ queryKey: K.dashboard });
    },
  });
}

export function useMarkNCENotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: NCEMarkReadParams) => markNCENotificationRead(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nce", "notifications"] });
      qc.invalidateQueries({ queryKey: K.dashboard });
    },
  });
}

export function useArchiveNCENotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) => archiveNCENotification(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nce", "notifications"] });
      qc.invalidateQueries({ queryKey: K.dashboard });
    },
  });
}

export function useCreateNCETemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: NCECreateTemplateParams) => createNCETemplate(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nce", "templates"] });
      qc.invalidateQueries({ queryKey: K.dashboard });
    },
  });
}

export function useUpdateNCETemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: NCEUpdateTemplateParams) => updateNCETemplate(params),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["nce", "templates"] });
      qc.invalidateQueries({ queryKey: K.template(vars.id) });
    },
  });
}

export function useUpdateNCEPreference() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: NCEUpdatePreferenceParams) => updateNCEPreference(params),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: K.preference(vars.userId) });
    },
  });
}

export function useGenerateNCEDigest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (params: NCEGenerateDigestParams) => generateNCEDigest(params),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nce", "digests"] });
      qc.invalidateQueries({ queryKey: K.dashboard });
    },
  });
}

export function useConsumeNCEAUEEvents() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (limit?: number) => consumeNCEAUEEvents(limit),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["nce"] });
    },
  });
}
