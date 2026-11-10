type CreateProjectCardProps = {
  onClick: () => void;
};

function CreateProjectCard({ onClick }: CreateProjectCardProps) {
  return (
    <button type="button" className="create-project-card" onClick={onClick}>
      <div className="create-icon">
        <span className="material-symbols-sharp">add</span>
      </div>

      <h3>Start something new</h3>
      <p>Blank canvas or from an image</p>
    </button>
  );
}

export default CreateProjectCard;
