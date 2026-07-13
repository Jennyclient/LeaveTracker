"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { ProfileDetailField } from "@/components/shared/profile-detail-field";
import { ProfileSectionCard } from "@/components/shared/profile-section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  dialogFlushFooterClass,
  dialogFlushHeaderClass,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { emptyCertification } from "@/lib/employee-skills";
import { formatDate } from "@/lib/format";
import { createEmployeeSkills, updateEmployeeSkills } from "@/lib/profile";
import type {
  EmployeeCertification,
  EmployeeProfile,
  EmployeeSkill,
  ProfileApprovalStatus,
} from "@/types";

interface EmployeeSkillsCardProps {
  profile: EmployeeProfile;
  onUpdated: (profile: EmployeeProfile) => void;
  dialogOpen?: boolean;
  onDialogOpenChange?: (open: boolean) => void;
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-3 pt-1">
      <p className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {title}
      </p>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function VerificationStatusPanel({ status }: { status: ProfileApprovalStatus }) {
  const config: Record<
    ProfileApprovalStatus,
    { emoji: string; label: string; className: string }
  > = {
    not_submitted: {
      emoji: "⚪",
      label: "Not submitted yet",
      className: "border-border bg-muted/20 text-muted-foreground",
    },
    pending: {
      emoji: "🟡",
      label: "Pending Admin Review",
      className:
        "border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400",
    },
    approved: {
      emoji: "🟢",
      label: "Verified by Admin",
      className:
        "border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400",
    },
    rejected: {
      emoji: "🔴",
      label: "Rejected — please update and resubmit",
      className: "border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400",
    },
  };

  const item = config[status];

  return (
    <div className="space-y-2">
      <SectionDivider title="Verification Status" />
      <div
        className={`flex items-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${item.className}`}
      >
        <span>{item.emoji}</span>
        <span>{item.label}</span>
      </div>
    </div>
  );
}

export function EmployeeSkillsCard({
  profile,
  onUpdated,
  dialogOpen,
  onDialogOpenChange,
}: EmployeeSkillsCardProps) {
  const status = profile.skillsStatus ?? "not_submitted";
  const isPending = status === "pending";
  const hasData =
    Boolean(profile.skills?.length) ||
    Boolean(profile.certifications?.length) ||
    Boolean(profile.primarySkill?.trim()) ||
    Boolean(profile.resumeUrl);
  const canEdit = !isPending || hasData;

  const [internalOpen, setInternalOpen] = useState(false);
  const isDialogOpen = dialogOpen ?? internalOpen;
  const setDialogOpen = onDialogOpenChange ?? setInternalOpen;

  const [isSaving, setIsSaving] = useState(false);
  const [skills, setSkills] = useState<EmployeeSkill[]>(profile.skills ?? []);
  const [primarySkill, setPrimarySkill] = useState(profile.primarySkill ?? "");
  const [certifications, setCertifications] = useState<EmployeeCertification[]>(
    profile.certifications?.length ? profile.certifications : [emptyCertification()]
  );
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl ?? "");
  const [newSkillName, setNewSkillName] = useState("");
  const [showSkillInput, setShowSkillInput] = useState(false);

  const resetForm = () => {
    setSkills(profile.skills ?? []);
    setPrimarySkill(profile.primarySkill ?? "");
    setCertifications(
      profile.certifications?.length ? profile.certifications : [emptyCertification()]
    );
    setResumeUrl(profile.resumeUrl ?? "");
    setNewSkillName("");
    setShowSkillInput(false);
  };

  useEffect(() => {
    if (isDialogOpen) {
      resetForm();
    }
  }, [isDialogOpen, profile]);

  const addSkill = () => {
    const name = newSkillName.trim();
    if (!name) return;

    if (skills.some((skill) => skill.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Skill already added");
      return;
    }

    const nextSkills = [...skills, { name, proficiency: 3 }];
    setSkills(nextSkills);
    if (!primarySkill) {
      setPrimarySkill(name);
    }
    setNewSkillName("");
    setShowSkillInput(false);
  };

  const removeSkill = (name: string) => {
    const nextSkills = skills.filter((skill) => skill.name !== name);
    setSkills(nextSkills);
    if (primarySkill === name) {
      setPrimarySkill(nextSkills[0]?.name ?? "");
    }
  };

  const updateCertification = (
    index: number,
    field: keyof EmployeeCertification,
    value: string
  ) => {
    setCertifications(
      certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    );
  };

  const addCertification = () => {
    setCertifications([...certifications, emptyCertification()]);
  };

  const removeCertification = (index: number) => {
    if (certifications.length === 1) {
      setCertifications([emptyCertification()]);
      return;
    }
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!skills.length) {
      toast.error("Please add at least one technical skill");
      return;
    }

    if (!primarySkill.trim()) {
      toast.error("Please select a primary skill");
      return;
    }

    const filledCertifications = certifications.filter((cert) => cert.name.trim());

    for (const cert of filledCertifications) {
      if (!cert.name.trim()) {
        toast.error("Each certification needs a name");
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        skills,
        primarySkill,
        certifications: filledCertifications.length ? filledCertifications : undefined,
        resumeUrl: resumeUrl.trim() || undefined,
      };

      const saveSkills = hasData ? updateEmployeeSkills : createEmployeeSkills;
      const updated = await saveSkills(payload);
      onUpdated(updated);
      setDialogOpen(false);
      toast.success(
        hasData
          ? "Skills updated and sent for verification"
          : "Skills submitted for verification"
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit skills";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const actionLabel = !hasData
    ? "+ Add details"
    : status === "rejected"
      ? "Edit & Resubmit"
      : "Edit";

  return (
    <>
      <ProfileSectionCard
        title="Skills & Certifications"
        status={status}
        action={
          canEdit ? (
            <Button
              variant="link"
              size="sm"
              className="h-auto px-0 text-primary"
              onClick={() => setDialogOpen(true)}
            >
              {actionLabel}
            </Button>
          ) : undefined
        }
      >
        {!hasData ? (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed bg-muted/20 px-4 py-6">
            <p className="text-sm text-muted-foreground">
              Add your professional skills and certifications for admin verification.
            </p>
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => setDialogOpen(true)}>
                + Add details
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Technical Skills
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {profile.skills?.map((skill) => (
                  <Badge key={skill.name} variant="secondary" className="font-normal">
                    {skill.name}
                  </Badge>
                ))}
              </div>
            </div>

            <ProfileDetailField label="Primary Skill" value={profile.primarySkill} />

            {profile.resumeUrl && (
              <ProfileDetailField
                label="Resume"
                value={
                  <a
                    href={profile.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    View resume
                  </a>
                }
              />
            )}

            {profile.certifications && profile.certifications.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Certifications
                </p>
                {profile.certifications.map((cert, index) => (
                  <div
                    key={`${cert.name}-${index}`}
                    className="rounded-lg border bg-muted/10 p-3 text-sm"
                  >
                    <p className="font-medium">{cert.name}</p>
                    {cert.issuedBy ? (
                      <p className="text-muted-foreground">{cert.issuedBy}</p>
                    ) : null}
                    {cert.issueDate && (
                      <p className="text-xs text-muted-foreground">
                        Issued {formatDate(cert.issueDate)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {status === "rejected" && (
          <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-700 dark:text-red-400">
            Your skills were rejected. Please update and resubmit.
          </p>
        )}
      </ProfileSectionCard>

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[min(92vh,760px)] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className={dialogFlushHeaderClass}>
            <DialogTitle>Skills & Certifications</DialogTitle>
            <DialogDescription>
              Add your professional skills for admin verification.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div className="space-y-3.5">
              <Label className="block text-foreground leading-snug">
                Technical Skills <span className="text-destructive">*</span>
              </Label>
              <div className="flex flex-wrap items-center gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill.name}
                    variant="secondary"
                    className="gap-1 rounded-md px-2.5 py-1 pr-1 text-sm font-normal"
                  >
                    {skill.name}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill.name)}
                      className="rounded-full p-0.5 hover:bg-muted"
                      disabled={isSaving}
                      aria-label={`Remove ${skill.name}`}
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
                {!showSkillInput ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 px-2.5"
                    onClick={() => setShowSkillInput(true)}
                    disabled={isSaving}
                  >
                    <Plus className="size-4" />
                  </Button>
                ) : (
                  <div className="flex w-full gap-2 sm:w-auto">
                    <Input
                      autoFocus
                      placeholder="e.g. React"
                      value={newSkillName}
                      onChange={(e) => setNewSkillName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                        if (e.key === "Escape") {
                          setShowSkillInput(false);
                          setNewSkillName("");
                        }
                      }}
                      disabled={isSaving}
                      className="h-8 bg-background"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={addSkill}
                      disabled={isSaving || !newSkillName.trim()}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3.5">
              <Label className="block text-foreground leading-snug">
                Primary Skill <span className="text-destructive">*</span>
              </Label>
              <Select
                value={primarySkill || "none"}
                onValueChange={(value) =>
                  setPrimarySkill(value === "none" ? "" : value)
                }
                disabled={isSaving || skills.length === 0}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select primary skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select primary skill</SelectItem>
                  {skills.map((skill) => (
                    <SelectItem key={skill.name} value={skill.name}>
                      {skill.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <SectionDivider title="Certifications" />
              {certifications.map((cert, index) => (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border bg-muted/10 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">
                      Certification {certifications.length > 1 ? index + 1 : ""}
                    </p>
                    {certifications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => removeCertification(index)}
                        disabled={isSaving}
                        aria-label="Remove certification"
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-3.5">
                    <Label className="block leading-snug">Certification Name</Label>
                    <Input
                      placeholder="e.g. AWS Cloud Practitioner"
                      value={cert.name}
                      onChange={(e) =>
                        updateCertification(index, "name", e.target.value)
                      }
                      disabled={isSaving}
                      className="bg-background"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCertification}
                disabled={isSaving}
              >
                <Plus className="size-4" />
                Add Another
              </Button>
            </div>

            <div className="space-y-3.5">
              <Label className="block text-foreground leading-snug">
                Resume URL
              </Label>
              <Input
                type="url"
                placeholder="https://example.com/resume/your-name.pdf"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                disabled={isSaving}
                className="bg-background"
              />
            </div>

            <VerificationStatusPanel status={status} />
          </div>

          <DialogFooter className={dialogFlushFooterClass}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit for Verification"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
