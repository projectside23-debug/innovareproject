type FilmSearchFilterBarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sizeFilter: string;
  onSizeFilterChange: (value: string) => void;
  regionFilter: string;
  onRegionFilterChange: (value: string) => void;
  sortValue: string;
  onSortChange: (value: string) => void;
  regions: string[];
  onAddFirm: () => void;
};

export function FilmSearchFilterBar({
  searchValue,
  onSearchChange,
  sizeFilter,
  onSizeFilterChange,
  regionFilter,
  onRegionFilterChange,
  sortValue,
  onSortChange,
  regions,
  onAddFirm
}: FilmSearchFilterBarProps) {
  return (
    <div className="rounded-[1.8rem] border border-[rgba(78,39,19,0.08)] bg-[linear-gradient(180deg,#ffffff_0%,#fbf2eb_100%)] p-4 shadow-[0_18px_50px_rgba(61,32,17,0.07)] md:p-5">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,0.7fr))_auto]">
        <input
          className="form-field"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search film firms, cities, states, notes, or regions"
          value={searchValue}
        />

        <select
          className="form-field"
          onChange={(event) => onSizeFilterChange(event.target.value)}
          value={sizeFilter}
        >
          <option value="all">All studio sizes</option>
          <option value="large">Large studios</option>
          <option value="small">Independent / small</option>
        </select>

        <select
          className="form-field"
          onChange={(event) => onRegionFilterChange(event.target.value)}
          value={regionFilter}
        >
          <option value="all">All regions</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>

        <select
          className="form-field"
          onChange={(event) => onSortChange(event.target.value)}
          value={sortValue}
        >
          <option value="alphabetical">Sort A-Z</option>
          <option value="large-first">Large first</option>
          <option value="small-first">Small first</option>
          <option value="recently-added">Recently added</option>
        </select>

        <button
          className="rounded-full bg-[linear-gradient(135deg,#2f170a_0%,#7c3d1f_100%)] px-5 py-3 text-sm text-white shadow-[0_20px_50px_rgba(73,36,19,0.18)] transition hover:-translate-y-0.5"
          onClick={onAddFirm}
        >
          Add film firm
        </button>
      </div>
    </div>
  );
}
