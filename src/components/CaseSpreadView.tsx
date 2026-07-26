import type { DemoSelections } from "../types/demo";
import type { TemplateSpreadSnapshot } from "../types/tarot";
import { SpreadPreview } from "./SpreadPreview";

interface CaseSpreadViewProps {
  snapshot: TemplateSpreadSnapshot;
  onOpenPersonalMeaning: (cardId: string) => void;
}

/** 只使用案例保存时的快照展示牌阵，不读取最新内置模板。 */
export function CaseSpreadView({
  snapshot,
  onOpenPersonalMeaning,
}: CaseSpreadViewProps) {
  const selections: DemoSelections = Object.fromEntries(
    snapshot.positions.map((position) => [
      position.positionId,
      {
        cardId: position.cardId,
        orientation: position.orientation,
      },
    ]),
  );

  return (
    <SpreadPreview
      activePositionId={null}
      readOnly
      selections={selections}
      template={snapshot}
      onOpenPersonalMeaning={onOpenPersonalMeaning}
    />
  );
}
