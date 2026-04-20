type SearchFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  boutiqueFilter: string;
  onBoutiqueFilterChange: (value: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  categories: string[];
  onAddFirm: () => void;
};

export function SearchFilterBar({
  searchValue,
  onSearchChange,
  boutiqueFilter,
  onBoutiqueFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortValue,
  onSortChange,
  categories,
  onAddFirm
}: SearchFilterBarProps) {
  return (
    <div className="rounded-[1.8rem] border border-[rgba(12,33,48,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#eef5f8_100%)] p-4 shadow-[0_18px_50px_rgba(8,20,30,0.07)] md:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto]">
        <input
          className="form-field"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search organizations, sectors, notes, locations, or aliases"
          value={searchValue}
        />

        <select
          className="form-field"
          onChange={(event) => onBoutiqueFilterChange(event.target.value)}
          value={boutiqueFilter}
        >
          <option value="all">All profile types</option>
          <option value="boutique">Independent only</option>
          <option value="institutional">Institutional only</option>
        </select>

        <select
          className="form-field"
          onChange={(event) => onCategoryFilterChange(event.target.value)}
          value={categoryFilter}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="form-field"
          onChange={(event) => onSortChange(event.target.value)}
          value={sortValue}
        >
          <option value="alphabetical">Sort A-Z</option>
          <option value="boutique-first">Boutique first</option>
          <option value="institutional-first">Institutional first</option>
          <option value="recently-added">Recently added</option>
        </select>

        <button
          className="rounded-full bg-[linear-gradient(135deg,#0b1d2b_0%,#1a6174_100%)] px-5 py-3 text-sm text-white shadow-[0_20px_50px_rgba(10,24,38,0.18)] transition hover:-translate-y-0.5"
          onClick={onAddFirm}
        >
          Add entry
        </button>
      </div>
    </div>
  );
}
