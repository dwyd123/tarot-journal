interface MobileCreateButtonProps {
  onCreate: () => void;
}

export function MobileCreateButton({
  onCreate,
}: MobileCreateButtonProps) {
  return (
    <button
      className="mobile-create-button"
      type="button"
      aria-label="新建案例"
      onClick={onCreate}
    >
      <span aria-hidden="true">＋</span>
    </button>
  );
}
