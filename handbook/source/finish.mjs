import {questions,setAnswer} from './core.mjs';
import {included} from './levels.mjs';
export function finishWithExamples(project){
 const added=[];
 for(const q of questions){
  if(!included(q,project.interviewLevel,project.applicability)||q.type==='image'||project.skips[q.id]||String(project.answers[q.id]||'').trim())continue;
  const example=String(q.example||'').replace(/^Example: /,'').trim();
  if(!example)continue;
  setAnswer(project,q.id,example);added.push(q.id);
 }
 return added;
}
