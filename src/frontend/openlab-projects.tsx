"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { galleryConfig, type WorkItem } from "./config";

type ProjectResponse = {
  projects?: WorkItem[];
};

type OpenLabProjectsContextValue = {
  projects: WorkItem[];
  isLoading: boolean;
  error?: string;
  reloadProjects: () => Promise<void>;
};

const OpenLabProjectsContext = createContext<OpenLabProjectsContextValue>({
  projects: galleryConfig.works,
  isLoading: true,
  reloadProjects: async () => undefined,
});

export function OpenLabProjectsProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<WorkItem[]>(galleryConfig.works);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  async function loadProjects() {
    setIsLoading(true);
    try {
      const response = await fetch("/api/experiments", { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Failed to load projects (${response.status})`);
      const data = (await response.json()) as ProjectResponse;
      if (data.projects && data.projects.length > 0) {
        setProjects(data.projects);
      }
      setError(undefined);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load projects");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  const value = useMemo(
    () => ({ projects, isLoading, error, reloadProjects: loadProjects }),
    [projects, isLoading, error],
  );

  return <OpenLabProjectsContext.Provider value={value}>{children}</OpenLabProjectsContext.Provider>;
}

export function useOpenLabProjects() {
  return useContext(OpenLabProjectsContext);
}
