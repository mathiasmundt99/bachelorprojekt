interface Props {
  projectCount: number;
}

function PageHeader({ projectCount }: Props) {
  return (
    <div className="page-header">
      <div>
        <span className="eyebrow">
          {String(projectCount).padStart(2, "0")} IN PROGRESS
        </span>

        <h1>Your projects</h1>
      </div>
    </div>
  );
}

export default PageHeader;
