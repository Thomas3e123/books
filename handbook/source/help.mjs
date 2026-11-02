export const controlHelp={
 projects:'Switch between handbooks saved in this browser on this device.',
 new:'Start a separate blank handbook. Your existing handbooks stay saved.',
 duplicate:'Create a separate copy of this handbook, including its answers and design.',
 backup:'Download an editable .gravityhandbook backup. Keep it to restore your work or move it to another device.',
 restore:'Open a .gravityhandbook backup as a separate restored project. PDF and Word files cannot be imported here.',
 savingInstructions:'Step-by-step help for saving, downloading, restoring, and starting another handbook.',
 help:'Open the full guide. Closing it returns you to your current work.',
 level:'Choose interview depth. Basic and Extended adapt to Business fit. Changing levels preserves saved answers.',
 finishExamples:'Fill unanswered text questions in this interview with examples and open review. Existing answers, skips, and logo stay unchanged.',
 review:'Find unanswered, postponed, or excluded questions; review wording and recent changes.',
 design:'Choose a template or custom fonts and colors, add a logo, and set the edition.',
 previewOnly:'View the handbook without downloading a file.',
 preview:'Open the preview with PDF, Word, and print-ready download choices.',
 'edition-label':'Name this version of the handbook, such as First edition or 2027 revision.',
 'edition-date':'Optional date when this edition takes effect. This is not the date your project was saved.'
};
export const actionHelp={
 Save:'Save this answer in the browser and move to the next question in this set. This does not download a file.',
 'Save & continue →':'Save and move to the next set. A warning appears if this set contains unanswered or skipped questions.',
 'Use example & save':'Copy the displayed example into this answer, save it, and move to the next question. You can edit it afterward.',
 'Use example, save & continue →':'Adopt this example as your answer, save it, and continue to the next set.',
 'Replace with example':'Replace your current wording with the displayed example. Different existing wording requires confirmation.',
 'Skip for Now':'Postpone this question and leave its wording out of the handbook until restored.',
 'Skip Altogether':'Exclude this question from the handbook. You can restore it later in Review.',
 'Restore this question':'Bring this question back, including its previously saved wording when available.',
 Restore:'Bring this skipped question and any archived answer back into the handbook.',
 'Keep for Later':'Leave this question postponed so you can return to it from Review.',
 '← Previous set':'Return to the preceding group of questions without clearing answers.',
 'See my first section':'Preview the handbook content you have entered so far.',
 'Preview handbook so far':'Preview saved answers; unanswered and skipped questions are not included.',
 'Download PDF':'Download a handbook with the same page layout as this preview. Keep a project backup separately.',
 'Download editable Word':'Download a Word document. Word edits do not update the Creator, and page layout may differ.',
 'Print-ready PDF':'Download a PDF to open and print. Use Actual size with US Letter paper.',
 'Return to interview':'Return to your questions to edit or add answers.',
 'Change style':'Return to the design controls to change the handbook appearance.',
 'Add or change logo':'Open the logo question. Upload a PNG, JPG, or WebP image smaller than 4 MB.',
 'Remove logo':'Remove the current logo from this handbook.',
 'Accept correction':'Apply this displayed spacing or repeated-word suggestion to the answer.',
 'Restore previous wording':'Replace the answer with the earlier wording shown in this history entry.',
 'Return to handbook':'Close the guide and return to your current work.'
};
export function setHelp(node,text){if(!text)return;node.title=text;node.setAttribute('aria-description',text);}
export function applyHelp(root=document){
 for(const [id,text]of Object.entries(controlHelp)){const node=root.querySelector('#'+id);if(node)setHelp(node,text);}
 for(const node of root.querySelectorAll('button'))setHelp(node,actionHelp[node.textContent.trim()]);
 for(const node of root.querySelectorAll('[id^="fit-"]'))setHelp(node,'Select whether this topic applies. Not sure keeps it available for review. This changes interview topics, not saved policy wording.');
 for(const node of root.querySelectorAll('textarea'))setHelp(node,'Enter your policy wording. Typing saves automatically in this browser. The example below is used only when you choose it.');
 for(const node of root.querySelectorAll('select[aria-label],input[type="color"]')){
  const label=node.getAttribute('aria-label')||'';
  if(label==='Color palette')setHelp(node,'Choose a complete design template or Create your own style for separate font and color choices.');
  else if(label==='Page background')setHelp(node,'Choose cream or white for the handbook page background.');
  else if(label.endsWith(' font'))setHelp(node,'Choose the font for '+label.slice(0,-5).toLowerCase()+'. Check readability in the preview.');
  else if(label.endsWith(' color'))setHelp(node,'Choose the color for '+label.slice(0,-6).toLowerCase()+'. Use enough contrast against the page background.');
 }
}
