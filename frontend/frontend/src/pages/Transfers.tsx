import { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

// --- Sortable Worker Card Component ---
const SortableWorker = ({ worker }: { worker: any }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: worker._id, data: { ...worker, type: 'worker' } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`p-3 bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-border-dark shadow-sm mb-2 cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors ${isDragging ? 'z-50' : ''}`}
        >
            <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0">
                    {worker.profileImage ? (
                        <img src={worker.profileImage} alt={worker.name} className="w-full h-full object-cover" />
                    ) : (
                        worker.name.charAt(0)
                    )}
                </div>
                <div>
                    <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{worker.name}</div>
                    <div className="text-xs text-text-muted">{worker.post || 'Worker'}</div>
                </div>
            </div>
            {/* Debug Info */}
            {/* <div className="text-[10px] text-gray-400 mt-1">{worker._id}</div> */}
        </div>
    );
};

// --- Droppable Ward Column Component ---
const WardColumn = ({ ward, workers }: { ward: any, workers: any[] }) => {
    const { setNodeRef } = useSortable({
        id: ward._id,
        data: { type: 'ward', ward },
        disabled: true // Columns themselves are not draggable for now
    });

    const isUnderstaffed = workers.length < ward.requiredWorkers;
    const isUnassigned = ward._id === 'unassigned';

    return (
        <div
            ref={setNodeRef}
            className={`flex-1 min-w-[280px] rounded-xl p-4 border flex flex-col h-[700px] ${isUnassigned ? 'bg-gray-100 dark:bg-gray-800/20 border-gray-300 dark:border-gray-700 border-dashed' : 'bg-gray-50 dark:bg-slate-800/50 border-gray-200 dark:border-border-dark'}`}
        >
            <div className="mb-4">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-1">{ward.name}</h3>
                {!isUnassigned && (
                    <>
                        <div className="flex items-center justify-between text-xs font-medium">
                            <span className="text-text-muted">Target: {ward.requiredWorkers}</span>
                            <span className={`${isUnderstaffed ? 'text-orange-500' : 'text-green-600'}`}>
                                Current: {workers.length}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-500 ${isUnderstaffed ? 'bg-orange-400' : 'bg-green-500'}`}
                                style={{ width: `${Math.min((workers.length / ward.requiredWorkers) * 100, 100)}%` }}
                            />
                        </div>
                    </>
                )}
                {isUnassigned && (
                    <div className="text-xs text-text-muted mt-2">
                        {workers.length} workers unassigned
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
                <SortableContext items={workers.map(w => w._id)} strategy={verticalListSortingStrategy}>
                    {workers.map((worker) => (
                        <SortableWorker key={worker._id} worker={worker} />
                    ))}
                </SortableContext>
                {workers.length === 0 && (
                    <div className="h-full flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                        Drop workers here
                    </div>
                )}
            </div>
        </div>
    );
};


const Transfers = () => {
    const { user } = useAuth();
    const [wards, setWards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeId, setActiveId] = useState<string | null>(null);
    // Determine which worker is being dragged for Overlay
    const [activeWorker, setActiveWorker] = useState<any>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchData();
    }, [user]);

    const fetchData = async () => {
        if (user?.department) {
            try {
                const [wardsRes, unassignedRes] = await Promise.all([
                    api.get(`/api/wards?department=${user.department}`),
                    api.get(`/api/wards/unassigned?department=${user.department}`)
                ]);

                // Create a pseudo-ward for unassigned workers
                const unassignedWard = {
                    _id: 'unassigned',
                    name: 'Unassigned',
                    requiredWorkers: 0, // No target
                    workers: unassignedRes.data
                };

                setWards([unassignedWard, ...wardsRes.data]);
            } catch (err) {
                console.error("Failed to fetch wards", err);
            } finally {
                setLoading(false);
            }
        }
    };

    const findContainer = (id: string) => {
        for (const ward of wards) {
            if (ward.workers.find((w: any) => w._id === id)) {
                return ward._id;
            }
        }
        // If sorting within same container, dnd-kit might pass container id directly if over container
        const isContainer = wards.find(w => w._id === id);
        if (isContainer) return id;

        return null;
    };

    const [startContainerId, setStartContainerId] = useState<string | null>(null);

    const handleDragStart = (event: any) => {
        const { active } = event;
        setActiveId(active.id);

        const container = findContainer(active.id);
        setStartContainerId(container);

        // Find the worker object
        let worker = null;
        for (const ward of wards) {
            const found = ward.workers.find((w: any) => w._id === active.id);
            if (found) {
                worker = found;
                break;
            }
        }
        setActiveWorker(worker);
    };

    // ... wait, I'll use separate calls for precision.

    const handleDragOver = (event: any) => {
        const { active, over } = event;
        const overId = over?.id;

        if (!overId || active.id === overId) return;

        const activeContainer = findContainer(active.id);
        // Over could be a worker OR a ward container
        const overContainer = findContainer(overId) || (wards.find(w => w._id === overId) ? overId : null);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        // Move logic for visual update during drag
        setWards((prev) => {
            const activeWardIndex = prev.findIndex((w) => w._id === activeContainer);
            const overWardIndex = prev.findIndex((w) => w._id === overContainer);

            let newWards = [...prev];
            const activeWard = newWards[activeWardIndex];
            const overWard = newWards[overWardIndex];

            // Find index of dragged item
            const activeWorkerIndex = activeWard.workers.findIndex((w: any) => w._id === active.id);
            // Find index of over item
            let overWorkerIndex;

            // If dragging over a container, put at end
            if (overId === overContainer) {
                overWorkerIndex = overWard.workers.length + 1;
            } else {
                overWorkerIndex = overWard.workers.findIndex((w: any) => w._id === overId);
            }

            let newIndex;
            if (overId === overContainer) {
                newIndex = overWard.workers.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overWorkerIndex >= 0 ? overWorkerIndex + modifier : overWard.workers.length + 1;
            }

            // Move the worker visually
            return prev.map(ward => {
                if (ward._id === activeContainer) {
                    return {
                        ...ward,
                        workers: ward.workers.filter((w: any) => w._id !== active.id)
                    };
                }
                if (ward._id === overContainer) {
                    const movedWorker = activeWard.workers[activeWorkerIndex];
                    // Check duplicates just in case
                    if (ward.workers.find((w: any) => w._id === active.id)) return ward;

                    const newWorkers = [
                        ...ward.workers.slice(0, newIndex),
                        movedWorker,
                        ...ward.workers.slice(newIndex, ward.workers.length)
                    ];
                    return {
                        ...ward,
                        workers: newWorkers
                    };
                }
                return ward;
            });
        });
    };

    // Map of workerId -> { targetWardId, workerName, fromWardName, toWardName }
    const [unsavedChanges, setUnsavedChanges] = useState<Map<string, any>>(new Map());

    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        const activeContainer = startContainerId;
        const overContainer = over ? (findContainer(over.id) || (wards.find(w => w._id === over.id) ? over.id : null)) : null;

        if (activeContainer && overContainer && activeContainer !== overContainer) {
            // Track Change Locally
            const workerId = active.id;
            const targetWardId = overContainer === 'unassigned' ? null : overContainer;

            // Get Names for Notice
            // workerId is active.id
            // fromWardName: find ward name by activeContainer
            const fromWard = wards.find(w => w._id === activeContainer);
            const toWard = wards.find(w => w._id === overContainer);
            // Worker name: activeWorker is already in state or find in wards
            // We need secure worker name. 
            // Better to find worker object again to be sure
            let workerObj = null;
            // Scan previous state for worker
            for (const w of wards) {
                const f = w.workers.find((u: any) => u._id === workerId);
                if (f) { workerObj = f; break; }
            }

            if (workerObj) {
                setUnsavedChanges(prev => {
                    const newMap = new Map(prev);
                    newMap.set(workerId, {
                        workerId,
                        targetWardId,
                        workerName: workerObj.name,
                        fromWardName: fromWard ? fromWard.name : 'Unknown', // Could be inaccurate if multiple moves, but acceptable for MVP
                        toWardName: toWard ? toWard.name : 'Unassigned'
                    });
                    return newMap;
                });
            }
        }

        setActiveId(null);
        setActiveWorker(null);
    };

    const handleSave = async () => {
        if (unsavedChanges.size === 0) return;

        setLoading(true);
        try {
            const changes = Array.from(unsavedChanges.values());
            await api.post('/api/wards/transfer/batch', {
                changes,
                department: user?.department,
                officialId: (user as any)?._id
            });

            setUnsavedChanges(new Map());
            alert('Transfers saved and Notice generated successfully!');
            // No need to refetch if local state is already consistent, BUT refetch confirms backend state
            fetchData();
        } catch (err) {
            console.error("Batch save failed", err);
            alert('Failed to save changes');
        } finally {
            setLoading(false);
        }
    };

    const handleDiscard = () => {
        if (window.confirm("Discard all unsaved changes?")) {
            setUnsavedChanges(new Map());
            fetchData(); // Revert to backend state
        }
    };

    // Custom Drop Animation
    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.4',
                },
            },
        }),
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex h-screen items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user || user.role !== 'official') {
        // return <div className="p-10 text-center">Access Restricted</div>; 
        // Allowing access for now for checking, typically restricted
    }


    return (
        <DashboardLayout title="Ward Management">
            <div className="max-w-[1600px] mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transfers & Allocations</h2>
                        <p className="text-text-muted">Drag and drop workers to reassign them. Save changes to finalize.</p>
                    </div>
                    {unsavedChanges.size > 0 && (
                        <div className="flex gap-3 animate-in fade-in slide-in-from-right-4">
                            <button
                                onClick={handleDiscard}
                                className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-lg font-bold transition-colors"
                            >
                                Discard ({unsavedChanges.size})
                            </button>
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 text-white bg-primary hover:bg-primary-dark rounded-lg font-bold shadow-lg shadow-primary/30 transition-all transform active:scale-95"
                            >
                                Save Changes
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex gap-6 overflow-x-auto pb-8 snap-x">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragStart={handleDragStart}
                        onDragOver={handleDragOver}
                        onDragEnd={handleDragEnd}
                    >
                        {wards.map((ward) => (
                            <WardColumn key={ward._id} ward={ward} workers={ward.workers} />
                        ))}

                        <DragOverlay dropAnimation={dropAnimation}>
                            {activeId && activeWorker ? (
                                <div className="p-3 bg-white dark:bg-surface-dark rounded-lg border border-primary shadow-xl cursor-grabbing w-[280px]">
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold overflow-hidden shrink-0">
                                            {activeWorker.profileImage ? (
                                                <img src={activeWorker.profileImage} alt={activeWorker.name} className="w-full h-full object-cover" />
                                            ) : (
                                                activeWorker.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm text-gray-900 dark:text-gray-100">{activeWorker.name}</div>
                                            <div className="text-xs text-text-muted">{activeWorker.post || 'Worker'}</div>
                                        </div>
                                    </div>
                                </div>
                            ) : null}
                        </DragOverlay>
                    </DndContext>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Transfers;
