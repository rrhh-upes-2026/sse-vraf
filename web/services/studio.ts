import { createEntityService } from "./entityService";
import type { BlueprintMetadata, InstanceSummary } from "@/types/studio";

export const BlueprintRegistryService = createEntityService<BlueprintMetadata>("blueprintRegistry");
export const InstanceSummariesService = createEntityService<InstanceSummary>("instanceSummaries");
