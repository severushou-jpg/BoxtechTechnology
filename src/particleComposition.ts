/** Counts in the index buffer, with an exact final flow/figure split. */
export function getParticleLayers(count: number, galaxyRatio: number) {
  const total = Math.max(2, Math.round(Number.isFinite(count) ? count : 50000));
  const ratio = Math.min(.7, Math.max(.1, Number.isFinite(galaxyRatio) ? galaxyRatio : .32));
  const galaxyCount = Math.max(1,Math.min(total-1,Math.round(total * ratio)));
  return {
    galaxyCount,
    galaxyOffset: 0,
    sceneCount: total - galaxyCount,
    sceneOffset: galaxyCount,
    galaxyVisibility: 1,
    sceneVisibility: 1,
  };
}

/** Select unique IDs. All figure targets are genuine subjects, and the flow
 * uses only IDs that the figures do not own. Changing a ratio never adds dots. */
export function buildParticleAllocation(subjectPrefix:ArrayLike<number>,contactPrefix:ArrayLike<number>,count:number,galaxyRatio:number) {
  const capacity=subjectPrefix.length-1;
  const layers=getParticleLayers(Math.min(capacity,count),galaxyRatio);
  const figureIndices=new Uint32Array(layers.sceneCount),flowIndices=new Uint32Array(layers.galaxyCount);
  const selected=new Uint8Array(capacity);
  let figures=0;
  for(let id=0;id<capacity && figures<figureIndices.length;id++) {
    if(subjectPrefix[id+1]>subjectPrefix[id] && contactPrefix[id+1]===contactPrefix[id]) {
      figureIndices[figures++]=id;selected[id]=1;
    }
  }
  if(figures!==figureIndices.length) throw new RangeError("Insufficient subject samples for this particle split.");
  let flows=0;
  for(let id=0;id<capacity && flows<flowIndices.length;id++) if(!selected[id]) flowIndices[flows++]=id;
  if(flows!==flowIndices.length) throw new RangeError("Insufficient distinct flow samples.");
  const indices=new Uint32Array(layers.galaxyCount+layers.sceneCount);
  indices.set(flowIndices);indices.set(figureIndices,layers.sceneOffset);
  return { ...layers,indices,figureIndices,flowIndices,subjectCount:figures,nebulaCount:flows };
}
