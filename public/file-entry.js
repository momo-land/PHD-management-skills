'use strict';
// A classic script also works when this HTML file is opened directly.
// The normal HTTP application is unaffected and does not need inline scripts.
if (location.protocol === 'file:') {
  const help = document.getElementById('file-entry-help');
  if (help) {
    help.hidden = false;
    const shell = document.querySelector('.app-shell');
    const skip = document.querySelector('.skip-link');
    if (shell) shell.hidden = true;
    if (skip) skip.hidden = true;
    Object.assign(document.body.style, {margin:'0', background:'#f3f3eb', color:'#253d2d', fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif', lineHeight:'1.8'});
    Object.assign(help.style, {boxSizing:'border-box', maxWidth:'640px', margin:'12vh auto', padding:'32px', background:'#fffefa', border:'1px solid #dce2d2', borderRadius:'16px', width:'calc(100% - 32px)'});
    Object.assign(document.getElementById('file-entry-brand').style, {fontSize:'13px', letterSpacing:'.8px', color:'#5b6b5a', margin:'0 0 18px'});
    Object.assign(document.getElementById('file-entry-title').style, {fontSize:'27px', lineHeight:'1.4', margin:'0 0 18px'});
    Object.assign(document.getElementById('file-entry-link').style, {display:'inline-block', margin:'12px 0', padding:'11px 18px', borderRadius:'9px', background:'#365a3f', color:'#fffefa', textDecoration:'none', fontWeight:'600'});
    Object.assign(document.getElementById('file-entry-note').style, {fontSize:'12px', color:'#5b6b5a', margin:'18px 0 0'});
  }
}
