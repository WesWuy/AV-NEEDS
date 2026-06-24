/**
 * store.ts — project/space factories + localStorage persistence + a small
 * React hook (useProjectStore) that autosaves on every change. No backend.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Project, Space, SpaceType } from '../types';
import { SCHEMA_VERSION } from '../types';
import { templateFor } from '../data/roomTemplates';

const LS_KEY = 'avixa-discovery-project-v1';

export function newId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}

export function createSpace(type: SpaceType = 'small-conf'): Space {
  const t = templateFor(type);
  return {
    name: t.label.replace(/\s*\(.*\)$/, ''),
    type,
    dimensions: { lengthM: null, widthM: null, ceilingHeightM: null },
    maxParticipants: null,
    seatingLayout: '',
    farthestViewerM: null,
    closestViewerM: null,
    viewingCategory: 'BDM',
    percentElementHeight: 0.05,
    verticalResolutionLines: 2160,
    aspectRatioW: 16,
    aspectRatioH: 9,
    ambientLightLux: null,
    noiseFloorDba: null,
    acousticNotes: '',
    useCases: [],
    audioIntent: 'speechReinforcement',
    vcPlatform: '',
    vcTopology: '',
    controlNeeds: '',
    networkNotes: '',
    displayTech: 'lcd',
    budgetTier: 'unknown',
    answers: {},
    operatorNotes: '',
    // template defaults override the blank baseline
    ...t.defaults,
    id: newId(),
  } as Space;
}

export function createProject(): Project {
  const now = new Date().toISOString();
  return {
    schemaVersion: SCHEMA_VERSION,
    id: newId(),
    clientName: '',
    siteName: '',
    contact: '',
    integrator: '',
    projectDate: now.slice(0, 10),
    notes: '',
    spaces: [createSpace('small-conf')],
    createdAt: now,
    updatedAt: now,
  };
}

export function loadProject(): Project | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Project;
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.spaces)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveProject(p: Project): void {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
  } catch {
    /* storage full / unavailable — surfaced via UI save status */
  }
}

/** React hook: load-or-create, autosave (debounced) on every mutation. */
export function useProjectStore() {
  const [project, setProject] = useState<Project>(() => loadProject() ?? createProject());
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      const stamped = { ...project, updatedAt: new Date().toISOString() };
      saveProject(stamped);
      setSavedAt(Date.now());
    }, 400);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [project]);

  const update = useCallback((fn: (p: Project) => Project) => {
    setProject((prev) => fn(prev));
  }, []);

  const updateSpace = useCallback(
    (spaceId: string, fn: (s: Space) => Space) => {
      setProject((prev) => ({
        ...prev,
        spaces: prev.spaces.map((s) => (s.id === spaceId ? fn(s) : s)),
      }));
    },
    [],
  );

  const addSpace = useCallback((type: SpaceType) => {
    const s = createSpace(type);
    setProject((prev) => ({ ...prev, spaces: [...prev.spaces, s] }));
    return s.id;
  }, []);

  const removeSpace = useCallback((spaceId: string) => {
    setProject((prev) => ({ ...prev, spaces: prev.spaces.filter((s) => s.id !== spaceId) }));
  }, []);

  const replaceProject = useCallback((p: Project) => setProject(p), []);

  const resetProject = useCallback(() => setProject(createProject()), []);

  return {
    project,
    savedAt,
    update,
    updateSpace,
    addSpace,
    removeSpace,
    replaceProject,
    resetProject,
  };
}
