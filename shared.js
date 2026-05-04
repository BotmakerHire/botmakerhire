// HireAI Shared State
const STORAGE_KEY = 'hireai_omint_v2';
const DEFAULT = {
  version:2, lastUpdate:Date.now(),
  job:{
    title:'Asesor/a Comercial', area:'Canal Comercial — CABA y GBA', company:'Omint S.A.',
    knockouts:['Disponibilidad presencial CABA/GBA','Experiencia en ventas','Disponibilidad 30 días'],
    jd:'Buscamos Asesores Comerciales para el equipo de ventas de Omint, líder en salud prepaga premium.',
    slots:['Lunes 09:00','Lunes 10:30','Martes 09:00','Martes 11:00','Miércoles 10:00','Jueves 09:30']
  },
  candidates:[],
  stats:{total:0,stage1:0,stage2:0,scheduled:0}
};

window.HireAI = {
  get(){ try{ return JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')||{...DEFAULT}; }catch(e){ return {...DEFAULT}; } },
  set(fn){ const s=typeof fn==='function'?fn(this.get()):{...this.get(),...fn}; s.lastUpdate=Date.now(); localStorage.setItem(STORAGE_KEY,JSON.stringify(s)); return s; },
  upsert(id,data){
    return this.set(s=>{
      const i=s.candidates.findIndex(c=>c.id===id);
      const base=i>=0?s.candidates[i]:{id,createdAt:Date.now(),stage:0,status:'active',recruiterApproved:false,calendarSlot:null,score1:null,score2:null,pdaProfile:null};
      const updated={...base,...data,updatedAt:Date.now()};
      const candidates=i>=0?s.candidates.map((c,j)=>j===i?updated:c):[...s.candidates,updated];
      const stats={total:candidates.length,stage1:candidates.filter(c=>c.stage>=1).length,stage2:candidates.filter(c=>c.stage>=2).length,scheduled:candidates.filter(c=>c.stage>=3).length};
      return{...s,candidates,stats};
    });
  },
  find(id){ return this.get().candidates.find(c=>c.id===id)||null; },
  reset(){ localStorage.setItem(STORAGE_KEY,JSON.stringify({...DEFAULT,lastUpdate:Date.now()})); },
  onChange(cb,ms=2500){
    let last=this.get().lastUpdate;
    window.addEventListener('storage',e=>{ if(e.key===STORAGE_KEY){ try{ cb(JSON.parse(e.newValue)); }catch(_){} } });
    return setInterval(()=>{ const s=this.get(); if(s.lastUpdate!==last){last=s.lastUpdate;cb(s);} },ms);
  }
};
