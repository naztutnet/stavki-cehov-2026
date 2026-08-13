const fs=require('fs');
let css=fs.readFileSync('app.css','utf8');
const patch=`
/* unified selects and filter controls v6 */
select{
  -webkit-appearance:none;
  appearance:none;
  padding-right:34px!important;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12' fill='none'%3E%3Cpath d='M3 4.5 6 7.5 9 4.5' stroke='%23515751' stroke-width='1.4' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat:no-repeat;
  background-position:right 12px center;
  background-size:12px 12px;
}
.row1{align-items:center}
.row1>select,.row1>.chk,.row1>.header-estimate{
  box-sizing:border-box;
  width:100%;
  min-width:0;
  height:38px;
  min-height:38px;
  max-height:38px;
}
.row1>.header-estimate{
  display:flex;
  align-items:center;
  justify-content:center;
  padding-top:0;
  padding-bottom:0;
  line-height:1;
}
.row1>.chk{padding-top:0;padding-bottom:0}
`;
css=css.replace(/\n\/\* unified selects and filter controls v6 \*\/[\s\S]*$/,'');
css+=patch;
fs.writeFileSync('app.css',css);

let index=fs.readFileSync('index.html','utf8');
const v='20260813-0307';
index=index.replace(/href="app\.css(?:\?v=[^"]*)?"/g,`href="app.css?v=${v}"`);
index=index.replace(/src="(updates|check-log|rates-data|sources-data|market-data|app)\.js(?:\?v=[^"]*)?"/g,(_,name)=>`src="${name}.js?v=${v}"`);
fs.writeFileSync('index.html',index);
console.log('Select arrows and filter control heights refined');
