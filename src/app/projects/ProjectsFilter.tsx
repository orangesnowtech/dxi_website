"use client";

type FilterType = "clients" | "projects";

interface ProjectsFilterProps {
  onFilterChange: (filter: FilterType) => void;
  currentFilter: FilterType;
}

export default function ProjectsFilter({ onFilterChange, currentFilter }: ProjectsFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onFilterChange("clients")}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          currentFilter === "clients"
            ? "bg-[#EF1111] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Clients
      </button>
      <button
        onClick={() => onFilterChange("projects")}
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          currentFilter === "projects"
            ? "bg-[#EF1111] text-white"
            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
        }`}
      >
        Projects
      </button>
    </div>
  );
}

