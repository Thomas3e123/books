import {sections,questions} from './core.mjs';
import {included} from './levels.mjs';
const cache=new Map();
export function groupsForLevel(level='full',applicability={}){const key=JSON.stringify([level,applicability]);if(cache.has(key))return cache.get(key);const groups=sections.flatMap(original=>{const section={...original,questions:original.questions.filter(q=>included(q,level,applicability))};const result=[];for(let offset=0;offset<section.questions.length;offset+=4){const items=section.questions.slice(offset,offset+4);result.push({section,offset,questions:items,start:questions.indexOf(items[0])});}return result;});cache.set(key,groups);return groups;}
export const interviewGroups=groupsForLevel('full');
export function groupForCursor(cursor,level='full',applicability={}){const groups=groupsForLevel(level,applicability);return groups.find(g=>g.questions.some(q=>questions.indexOf(q)===cursor))||groups[0];}
