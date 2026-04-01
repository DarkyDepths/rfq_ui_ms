import type {
  ManagerStageStatusResponse,
  ManagerStageTemplateResponse,
  StageProgressModel,
  StageTemplateModel,
} from "@/models/manager/stage";
import { formatDate } from "@/utils/format";

export function translateStageTemplate(
  stage: ManagerStageTemplateResponse,
): StageTemplateModel {
  return {
    id: stage.id,
    label: stage.label,
    order: stage.order,
    summary: stage.summary,
    ownerRole: stage.ownerRole,
  };
}

export function translateStageProgress(
  stage: ManagerStageStatusResponse,
): StageProgressModel {
  return {
    ...translateStageTemplate(stage),
    state: stage.state,
    timestampLabel: stage.timestamp ? formatDate(stage.timestamp) : undefined,
  };
}
