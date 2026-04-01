import type {
  WorkbookProfileModel,
  WorkbookProfileResponse,
  WorkbookReviewModel,
  WorkbookReviewResponse,
} from "@/models/intelligence/workbook";
import { formatDate } from "@/utils/format";

export function translateWorkbookProfile(
  profile: WorkbookProfileResponse,
): WorkbookProfileModel {
  return {
    kind: "workbook_profile",
    status: profile.status,
    version: profile.version,
    updatedLabel: profile.updatedAt ? formatDate(profile.updatedAt) : "Pending",
    completion: profile.completion,
    trackedSheets: profile.trackedSheets,
    missingSections: profile.missingSections,
    owner: profile.owner,
  };
}

export function translateWorkbookReview(
  review: WorkbookReviewResponse,
): WorkbookReviewModel {
  return {
    kind: "workbook_review",
    status: review.status,
    version: review.version,
    updatedLabel: review.updatedAt ? formatDate(review.updatedAt) : "Pending",
    readiness: review.readiness,
    missingResponses: review.missingResponses,
    flags: review.flags,
  };
}
