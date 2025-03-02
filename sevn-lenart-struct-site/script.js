const CHUNK_SIZE=50,HOME_KEYWORDS=["Home","Trang chủ","/"],MAX_LEVELS=5,elements={pasteBtn:document.getElementById("pasteButton"),downSitemapBtn:document.getElementById("downSitemap"),clearBtn:document.getElementById("clear"),urlInput:document.getElementById("urlInput"),copyTableBtn:document.getElementById("copyTableBtn"),exportCsvBtn:document.getElementById("exportCsvBtn"),retryBtn:document.getElementById("retryError"),progress:document.querySelector(".detail-handle .progress"),cout:document.querySelector(".detail-handle .cout"),time:document.querySelector(".detail-handle .time"),averageSpend:document.querySelector(".detail-handle .average-spend"),err:document.querySelector(".detail-handle .err")},appState={hasData:!1,isProcessing:!1,successUrls:[],errorUrls:[],currentProxy:0,proxyList:["https://api.allorigins.win/raw?url=","https://api.codetabs.com/v1/proxy?quest="]},statsState={startTime:0,endTime:0,totalUrls:0,processedUrls:0},errorResult={type:"Lỗi kết nối",id:"",cmsLink:"",title:"Lỗi kết nối",metaDescription:"Lỗi kết nối",shortlink:"",level1:"",level2:"",level3:"",level4:"",level5:""},toast={container:null,queue:[],timeoutId:null,activeToasts:{},init(){this.container||(this.container=document.createElement("div"),this.container.className="toast-container",document.body.appendChild(this.container))},show(t,e="info",r=3500){this.init();const n=document.createElement("div");n.className=`toast toast-${e}`,n.textContent=t,this.queue.push({element:n,duration:r}),this.processQueue()},showWithId(t,e="info",r=3500,n){this.init();const o=document.createElement("div");o.className=`toast toast-${e}`,o.textContent=t,o.id=n,this.activeToasts[n]=o,this.container.appendChild(o),setTimeout((()=>o.classList.add("show")),10),r>0&&setTimeout((()=>{this.hide(n)}),r)},updateMessage(t,e){this.activeToasts[t]&&(this.activeToasts[t].textContent=e)},hide(t){if(this.activeToasts[t]){const e=this.activeToasts[t];e.classList.remove("show"),setTimeout((()=>{e.remove(),delete this.activeToasts[t]}),300)}},processQueue(){if(this.timeoutId||0===this.queue.length)return;const{element:t,duration:e}=this.queue.shift();this.container.appendChild(t),setTimeout((()=>t.classList.add("show")),10),this.timeoutId=setTimeout((()=>{t.classList.remove("show"),setTimeout((()=>{t.remove(),this.timeoutId=null,this.processQueue()}),300)}),e)}};function formatTime(t){if(t<60)return`${t} giây`;const e=Math.floor(t/86400);t%=86400;const r=Math.floor(t/3600);t%=3600;const n=Math.floor(t/60);let o="";return e>0&&(o+=`${e} ngày `),r>0&&(o+=`${r} giờ `),n>0&&(o+=`${n} phút `),((t=Math.floor(t%60))>0||""===o)&&(o+=`${t} giây`),o.trim()}function updateStats(){const t=Date.now(),e=0==statsState.startTime?"0":(t-statsState.startTime)/1e3,r=0==statsState.processedUrls?"0":Math.ceil(statsState.processedUrls/e);elements.progress.textContent=`${statsState.processedUrls}/${statsState.totalUrls}`,elements.cout.textContent=statsState.totalUrls,elements.time.textContent=formatTime(e),elements.averageSpend.textContent=r,elements.err.textContent=appState.errorUrls.length}const toggleButtons={pasteButton:()=>{const t=!!elements.urlInput.value.trim();elements.pasteBtn.style.display=t?"none":"block",elements.downSitemapBtn.style.display=t?"none":"block",elements.clearBtn.style.display=t?"block":"none",elements.cout.textContent=t?urlInput.value.split("\n").filter((t=>t.trim())).length:0},actionButtons:t=>{[elements.copyTableBtn,elements.exportCsvBtn,elements.clearBtn].forEach((e=>{e&&(e.style.display=t?"block":"none")})),elements.retryBtn&&(elements.retryBtn.style.display=t&&appState.errorUrls.length>0?"block":"none")},init:()=>{toggleButtons.actionButtons(!1),toggleButtons.pasteButton()}};function validateAndProcessInput(t){return t.split("\n").map((t=>t.trim())).filter((t=>t.match(/^(https?:\/\/[^\s]+)/)))}async function pasteFromClipboard(){try{const t=await navigator.clipboard.readText();elements.urlInput.value=validateAndProcessInput(t).join("\n"),toggleButtons.pasteButton()}catch(t){toast.show(`Không thể dán:  ${t}`,"error")}}function copyColumn(t){const e=document.getElementById("resultTable"),r=Array.from(e.rows).slice(1).map((e=>e.cells[t].textContent.trim())).join("\n");navigator.clipboard.writeText(r).then((()=>{const r=e.querySelector(`th:nth-child(${t+1})`).querySelector("button"),n=r.textContent,o=r.style.cssText;r.textContent="Copied!",r.style.backgroundColor="#90EE90",r.style.borderColor="#4CAF50",setTimeout((()=>{r.textContent=n,r.style.cssText=o}),1e3)})).catch((t=>toast.show(`Không thể copy:  ${t}`,"error")))}function updateTableHeaders(){if(!appState.hasData)return;const t=document.querySelector("#resultTable thead tr");if(t.querySelector("button"))return;const e=document.querySelector("#resultTable tbody"),r=Array.from(e.rows);Array.from(t.cells).slice(1).forEach(((t,e)=>{const n=e+1;if(r.some((t=>{const e=t.cells[n].textContent.trim();return e&&"Lỗi"!==e&&"Không xác định"!==e&&"Không thể tạo link CMS"!==e}))){const e=document.createElement("button");e.textContent="Copy",e.style.cssText="\n                margin-left: .5rem;\n                cursor: pointer;\n                background: #f0f0f0;\n                border: 1px solid #ddd;\n                border-radius: 3px;\n                padding: 2px 6px;\n                font-size: 12px;\n                opacity: 0.8;\n                transition: all 0.2s ease;\n            ",e.onmouseover=()=>{e.style.opacity="1",e.style.backgroundColor="#e0e0e0"},e.onmouseout=()=>{e.style.opacity="0.8",e.style.backgroundColor="#f0f0f0"},e.onclick=t=>{t.stopPropagation(),copyColumn(n)},t.appendChild(e)}}))}function copyTable(){const t=document.getElementById("resultTable"),e=Array.from(t.rows).map((t=>Array.from(t.cells).map((t=>t.querySelector("button")?getCleanHeaderText(t):t.textContent.trim())).join("\t"))).join("\n");navigator.clipboard.writeText(e).then((()=>{const e=t.querySelector("tbody");e.style.backgroundColor="#61ff5540",setTimeout((()=>e.style.backgroundColor=""),700)}))}function downloadFile(t,e,r){const n=new Blob([t],{type:r}),o=document.createElement("a");o.href=window.URL.createObjectURL(n),o.download=e,o.click()}function getCleanHeaderText(t){const e=document.createElement("div");e.innerHTML=t.innerHTML;const r=e.querySelector("button");return r&&r.remove(),e.textContent.trim()}function encodeToUTF8(t){return(new TextEncoder).encode("\ufeff"+t)}function exportCSV(){const t=document.getElementById("resultTable"),e=Array.from(t.rows),r=Array.from(e[0].cells).map((t=>getCleanHeaderText(t))),n=e.slice(1).map((t=>Array.from(t.cells).map((t=>`"${t.textContent.trim().replace(/"/g,'""')}"`)))),o=[r.join(","),...n.map((t=>t.join(",")))].join("\n"),a=new Blob([encodeToUTF8(o)],{type:"text/csv;charset=utf-8"}),s=document.createElement("a");s.href=URL.createObjectURL(a),s.download="url-info-export.csv",s.click()}elements.urlInput.addEventListener("input",(function(){this.value=validateAndProcessInput(this.value).join("\n"),toggleButtons.pasteButton()}));const timeoutPromise=(t,e=3e4)=>Promise.race([t,new Promise(((t,r)=>setTimeout((()=>r(new Error("Request timeout"))),e)))]),urlCache=new Map;async function getUrlInfo(t,e=0){if(urlCache.has(t))return urlCache.get(t);const r=appState.proxyList[appState.currentProxy]+encodeURIComponent(t);try{const e=await timeoutPromise(fetch(r));if(!e.ok)throw new Error(`HTTP error! status: ${e.status}`);const n=await e.text(),o=(new DOMParser).parseFromString(n,"text/html");let{id:a,type:s}=getIdAndTypeFromBodyClass(o.body.getAttribute("class")||"")||getIdAndTypeFromJsonLink(o)||getIdFromPageItem(o)||{id:"",type:""};const l=extractBreadcrumbCategories(s,o),i={shortlink:getShortlink(o,t,a,s),id:a,type:s,title:o.querySelector("title")?.textContent||"",metaDescription:o.querySelector('meta[name="description"]')?.getAttribute("content")||"",cmsLink:getCmsLink(t,a,s),...l};appState.successUrls.includes(t)||appState.successUrls.push(t);const c=appState.errorUrls.indexOf(t);return c>-1&&appState.errorUrls.splice(c,1),urlCache.set(t,i),i}catch(r){return e<2?(appState.currentProxy=(appState.currentProxy+1)%appState.proxyList.length,await new Promise((t=>setTimeout(t,1e3*(e+1)))),getUrlInfo(t,e+1)):(appState.errorUrls.includes(t)||appState.errorUrls.push(t),urlCache.set(t,errorResult),errorResult)}}function clearData(){const t=document.querySelector("#resultTable tbody");elements.urlInput.value="",t.innerHTML="";document.querySelectorAll("#resultTable thead button").forEach((t=>t.remove())),appState.hasData=!1,appState.successUrls=[],appState.errorUrls=[],appState.currentProxy=0,statsState.startTime=0,statsState.endTime=0,statsState.totalUrls=0,statsState.processedUrls=0,updateStats(),toggleButtons.actionButtons(!1),toggleButtons.pasteButton(),urlCache.clear(),toast.show("Đã làm mới dữ liệu","success")}function updateButtonStates(){appState.hasData?(elements.clearBtn.style.display="block",elements.copyTableBtn.style.display="block",elements.exportCsvBtn.style.display="block",elements.retryBtn.style.display=appState.errorUrls.length>0?"block":"none"):(elements.clearBtn.style.display="none",elements.copyTableBtn.style.display="none",elements.exportCsvBtn.style.display="none",elements.retryBtn.style.display="none")}function checkForErrors(){const t=document.querySelectorAll("#resultTable tbody tr.error");appState.errorUrls=Array.from(t).map((t=>t.querySelector("td:nth-child(2) a").href)),updateButtonStates()}function getIdAndTypeFromBodyClass(t){const e=t.match(/postid-(\d+)/)||t.match(/page-id-(\d+)/)||t.match(/term-(\d+)/)||t.match(/category-(\d+)/);if(!e)return null;let r="unknown";return t.includes("single-product")?r="product":t.includes("single-post")||t.includes("postid-")?r="post":t.includes("page-template")||t.includes("page-")?r="page":t.includes("tax-product_cat")?r="product_cat":(t.includes("category")||t.includes("post-type-archive"))&&(r="category"),{id:e[1],type:r}}function getIdAndTypeFromJsonLink(t){const e=t.querySelector('link[rel="alternate"][title="JSON"][type="application/json"]')?.getAttribute("href");if(!e)return null;const r=e.match(/\/(categories|tags)\/(\d+)/);return r?{id:r[2],type:"categories"===r[1]?"category":"tag"}:null}function getIdFromPageItem(t){const e=t.querySelector('[class*="page-item-"]');if(!e)return null;const r=e.getAttribute("class").split(" ").find((t=>t.startsWith("page-item-")));if(!r)return null;return{id:r.replace("page-item-",""),type:"page"}}function getShortlink(t,e,r,n){let o=t.querySelector('link[rel="shortlink"]')?.getAttribute("href");if(!o&&r){const t=new URL(e).origin;switch(n){case"post":case"page":case"product":o=`${t}/?p=${r}`;break;case"product_cat":case"category":o=""}}return o??""}function getCmsLink(t,e,r){if(!e||"Không xác định"===e||"Lỗi"===e)return"";const n=new URL(t).origin;switch(r){case"page":case"post":case"product":return`${n}/wp-admin/post.php?post=${e}&action=edit`;case"product_cat":return`${n}/wp-admin/term.php?taxonomy=product_cat&tag_ID=${e}&post_type=product`;case"category":return`${n}/wp-admin/term.php?taxonomy=category&tag_ID=${e}&post_type=post`;default:return""}}function updateRow(t,e,r,n){t.classList.remove("loading-row"),t.innerHTML=`\n        <td>${e}</td>\n        <td title="${r}"><a href="${r}" target="_blank">${r}</a></td>\n        <td>${n.type}</td>\n        <td>${n.id}</td>\n        <td  title="${n.cmsLink}">${n.cmsLink.includes("http")?`<a href="${n.cmsLink}" target="_blank">${n.cmsLink}</a>`:n.cmsLink}</td>\n        <td title="${n.level1}">${n.level1}</td>\n        <td title="${n.level2}">${n.level2}</td>\n        <td title="${n.level3}">${n.level3}</td>\n        <td title="${n.level4}">${n.level4}</td>\n        <td title="${n.level5}">${n.level5}</td>\n        <td title="${n.shortlink}">${n.shortlink.includes("http")?`<a href="${n.shortlink}" target="_blank">${n.shortlink}</a>`:n.shortlink}</td>\n        <td title="${n.title}">${n.title}</td>\n        <td title="${n.metaDescription}">${n.metaDescription}</td>\n    `,""==n.id&&(t.classList.add("error"),appState.errorUrls.includes(r)||appState.errorUrls.push(r),updateButtonStates())}async function processChunk(t,e,r,n,o){const a=t.map(((t,a)=>getUrlInfo(t).then((s=>{n(e[r+a],r+a+1,t,s),o&&""!==s.id&&o(e[r+a]),statsState.processedUrls++,updateStats()})).catch((()=>{n(e[r+a],r+a+1,t,errorResult),statsState.processedUrls++,updateStats()}))));await Promise.all(a)}async function processUrls(){if(appState.isProcessing)return void toast.show("Đang xử lý, vui lòng đợi...","warning");const t=elements.urlInput,e=document.querySelector("#resultTable tbody"),r=t.value.split("\n").filter((t=>t.trim()));if(!r.length)return void toast.show("Vui lòng nhập ít nhất một URL","warning");statsState.startTime=Date.now(),statsState.totalUrls=r.length,statsState.processedUrls=0,updateStats(),appState.isProcessing=!0,e.innerHTML="",appState.successUrls=[],appState.errorUrls=[],appState.currentProxy=0;const n=r.map(((t,r)=>{const n=document.createElement("tr");return n.className="loading-row",n.innerHTML=`\n            <td>${r+1}</td>\n            <td><a href="${t}" target="_blank">${t}</a></td>\n            <td colspan="11">\n                <div class="loading">Đang xử lý...</div>\n            </td>\n        `,e.appendChild(n),n}));try{for(let t=0;t<r.length;t+=50){const e=r.slice(t,t+50);await processChunk(e,n,t,updateRow)}appState.hasData=!0,toggleButtons.actionButtons(!0),updateTableHeaders(),checkForErrors()}catch(t){}finally{appState.isProcessing=!1,statsState.endTime=Date.now(),updateStats(),document.querySelectorAll(".loading-row").forEach((t=>t.classList.remove("loading-row")))}}async function retryErrorUrls(){if(appState.isProcessing)return void toast.show("Đang xử lý, vui lòng đợi...","warning");if(!appState.errorUrls.length)return void toast.show("Không có URL lỗi để thử lại","info");appState.errorUrls.forEach((t=>urlCache.delete(t))),statsState.startTime=Date.now(),statsState.totalUrls=appState.errorUrls.length,statsState.processedUrls=0,updateStats(),appState.isProcessing=!0,appState.currentProxy=(appState.currentProxy+1)%appState.proxyList.length;const t=document.querySelector("#resultTable tbody"),e=Array.from(t.querySelectorAll("tr.error"));e.forEach((t=>{t.classList.add("loading-row");const e=t.cells,r=e[1].querySelector("a").href;t.innerHTML=`\n            <td>${e[0].textContent}</td>\n            <td><a href="${r}" target="_blank">${r}</a></td>\n            <td colspan="11">\n                <div class="loading">Đang xử lý...</div>\n            </td>\n        `}));try{const t=[...appState.errorUrls];appState.errorUrls=[],toast.show(`Bắt đầu thử lại ${t.length} URL lỗi...`,"info");for(let r=0;r<e.length;r+=50){const n=t.slice(r,r+50);await processChunk(n,e,r,updateRow,(t=>{t.classList.remove("error"),t.classList.add("retry-success"),t.classList.add("success-animation"),setTimeout((()=>t.classList.remove("success-animation")),1e3)}))}}catch(t){toast.show("Có lỗi xảy ra khi thử lại URLs","error")}finally{appState.isProcessing=!1,statsState.endTime=Date.now(),updateStats(),updateButtonStates();const t=appState.errorUrls.length;0===t?toast.show("Đã xử lý lại thành công tất cả URL!","success"):toast.show(`Đã xử lý lại xong. Còn ${t} URL vẫn bị lỗi.`,"warning")}}function extractBreadcrumbCategories(t,e){const r=Object.fromEntries(Array.from({length:MAX_LEVELS},((t,e)=>[`level${e+1}`,""])));if("page"==t)return r;return assignCategories(extractBreadcrumbItems(e),r,e.querySelector("h1")?.textContent.trim()||e.querySelector("h2")?.textContent.trim()||e.querySelector("title")?.textContent.trim()||""),r}function extractFromEntryCategory(t){const e=t.querySelector("h6.entry-category");if(!e)return[];const r=e.querySelectorAll("a[rel='category tag']");return r&&0!==r.length?Array.from(r).map((t=>t.textContent.trim())).filter((t=>t&&!HOME_KEYWORDS.includes(t))):[]}function extractBreadcrumbItems(t){const e=[extractFromJsonLD,extractFromSchemaOrg,extractFromRankMath,extractFromWooCommerce,extractFromClearfix,extractFromSimpleContainer,extractFromSimpleBreadcrumb,extractFromEntryCategory];for(const r of e){const e=r(t);if(e.length>0)return normalizeItems(e)}return[]}function findBreadcrumbList(t){if(Array.isArray(t)){for(const e of t){const t=findBreadcrumbList(e);if(t)return t}return null}if(t&&"object"==typeof t){if("BreadcrumbList"===t["@type"]&&Array.isArray(t.itemListElement))return t;for(const e in t){const r=findBreadcrumbList(t[e]);if(r)return r}}return null}function extractFromJsonLD(t){const e=Array.from(t.querySelectorAll('script[type="application/ld+json"]'));for(const t of e)try{const e=findBreadcrumbList(JSON.parse(t.textContent));if(e){const t=e.itemListElement.map((t=>t.name||t.item&&t.item.name||"")).filter((t=>t&&!HOME_KEYWORDS.includes(t)));if(t.length>0)return t}}catch(t){console.warn("Error parsing JSON-LD:",t)}return[]}function extractFromSchemaOrg(t){const e=[],r=t.querySelectorAll('[itemtype*="schema.org/BreadcrumbList"]');for(const t of r){const r=Array.from(t.children).filter((t=>"li"===t.tagName.toLowerCase()&&!t.classList.contains("home")));for(const t of r){const r=t.querySelectorAll('[itemprop="itemListElement"]');if(r.length>0){for(const t of r){const r=t.querySelector('[itemprop="name"]');r&&addValidItem(e,r.textContent)}continue}const n=t.querySelector('[itemprop="name"]');n?addValidItem(e,n.textContent):addValidItem(e,t.textContent.replace(/[,\/>]/g,""))}if(e.length>0)return e}return[]}function extractFromRankMath(t){const e=t.querySelector(".rank-math-breadcrumb");if(!e)return[];return["a","span.last"].flatMap((t=>Array.from(e.querySelectorAll(t)).map((t=>t.textContent.trim())).filter((t=>t&&!HOME_KEYWORDS.includes(t)))))}function extractFromSimpleBreadcrumb(t){const e=t.querySelector("nav.breadcrumb");if(!e)return[];const r=Array.from(e.querySelectorAll("a")).map((t=>t.textContent.trim())).filter((t=>t&&!HOME_KEYWORDS.includes(t)));if(0===r.length){const t=e.textContent.trim();if(t)return t.split(/[>\/\\\|→]/).map((t=>t.trim())).filter((t=>t&&!HOME_KEYWORDS.includes(t)&&!/^[\/,\s]+$/.test(t)))}return r}function extractFromWooCommerce(t){const e=t.querySelector(".woocommerce-breadcrumb");return e?Array.from(e.childNodes).map((t=>1===t.nodeType&&"a"===t.tagName.toLowerCase()||3===t.nodeType?t.textContent.trim():"")).filter(Boolean):[]}function extractFromClearfix(t){const e=t.querySelector(".ty-breadcrumbs");return e?Array.from(e.querySelectorAll('.ty-breadcrumbs__a [itemprop="name"]')).map((t=>t.textContent.trim())):[]}function extractFromSimpleContainer(t){const e=t.querySelector(".main-breadc");return e?Array.from(e.childNodes).map((t=>t.textContent.trim())).filter(Boolean):[]}function addValidItem(t,e){const r=e.replace(/\s+/g," ").trim();!r||HOME_KEYWORDS.includes(r)||/^[\/,\s]+$/.test(r)||t.push(r)}function normalizeItems(t){return t.map((t=>t.replace(/\s+/g," ").trim())).filter(((t,e,r)=>r.indexOf(t)===e&&""!==t&&!HOME_KEYWORDS.includes(t)&&!/^[\/,\s]+$/.test(t)))}function normalizeText(t){return t.trim().replace(/\s+/g," ").replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").toLowerCase()}function assignCategories(t,e,r){const n=normalizeText(r);let o=t.map((t=>({original:t,normalized:normalizeText(t)})));o.length>0&&o[o.length-1].normalized===n&&o.pop(),o.slice(0,MAX_LEVELS).forEach(((t,r)=>{e[`level${r+1}`]=t.original}))}async function getSitemapURLs(){const t=prompt("Nhập URL của sitemap (ví dụ: https://example.com/sitemap.xml):");if(t&&t.trim()&&isValidUrl(t))try{toast.show("Đang tải sitemap...","info");const e=appState.proxyList[appState.currentProxy]+encodeURIComponent(t),r=await timeoutPromise(fetch(e));if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);const n=await r.text();if(!n.includes("<?xml")&&!n.includes("<urlset")&&!n.includes("<sitemapindex"))throw new Error("Nội dung không phải là sitemap XML hợp lệ.");const o=(new DOMParser).parseFromString(n,"text/xml"),a=o.querySelector("parsererror");if(a)throw new Error("Lỗi khi phân tích XML: "+a.textContent);const s=o.getElementsByTagName("sitemap");if(s.length>0){const t=Array.from(s).map((t=>{const e=t.getElementsByTagName("loc")[0];return e?e.textContent.trim():null})).filter(Boolean);if(0===t.length)return void toast.show("Không tìm thấy sitemap con nào.","warning");const e="loading-sitemaps-"+Date.now();toast.showWithId(`Đang tải ${t.length} sitemap con...`,"info",999999,e);let r=[],n=0,o=0;for(let a=0;a<t.length;a++)try{const o=await fetchSingleSitemap(t[a]);r=[...r,...o],n++,toast.updateMessage(e,`Đang tải sitemap con (${n}/${t.length})...`)}catch(e){console.error(`Lỗi khi tải sitemap con ${a+1}:`,e),o++,a<t.length-1&&(appState.currentProxy=(appState.currentProxy+1)%appState.proxyList.length)}return toast.hide(e),void updateUrlInput(r)}updateUrlInput(extractUrlsFromXml(o))}catch(t){console.error("Error loading sitemap:",t),toast.show(`Lỗi khi tải sitemap: ${t.message}`,"error"),(t.message.includes("timeout")||t.message.includes("CORS"))&&(appState.currentProxy=(appState.currentProxy+1)%appState.proxyList.length,confirm("Lỗi kết nối. Bạn có muốn thử lại với proxy khác không?")&&getSitemapURLs())}else toast.show("URL sitemap không hợp lệ.","error")}async function fetchSingleSitemap(t){const e=appState.proxyList[appState.currentProxy]+encodeURIComponent(t),r=await timeoutPromise(fetch(e),6e4);if(!r.ok)throw new Error(`HTTP error! status: ${r.status}`);const n=await r.text();n.includes("<urlset")||n.includes("<url>")||console.warn("Định dạng sitemap không chuẩn:",n.substring(0,200)+"...");let o=[];try{const t=new DOMParser;o=extractUrlsFromXml(t.parseFromString(n,"text/xml"))}catch(t){console.warn("Lỗi khi phân tích XML bằng DOMParser:",t)}return 0===o.length&&(o=extractUrlsWithRegex(n)),o}function extractUrlsFromXml(t){const e=t.getElementsByTagName("url");if(0===e.length){console.warn("Không tìm thấy thẻ <url> trong sitemap, thử tìm các thẻ khác.");const e=Array.from(t.querySelectorAll("*|url")).filter((t=>t.tagName.includes("url")));if(e.length>0){const t=e.map((t=>{const e=t.querySelector("*|loc")||Array.from(t.children).find((t=>t.tagName.toLowerCase().includes("loc")));return e?e.textContent.trim():null})).filter(Boolean);return console.log(`Tìm thấy ${t.length} URL từ các namespace khác.`),t}return[]}const r=Array.from(e).map((t=>{const e=t.getElementsByTagName("loc")[0];return e?e.textContent.trim():null})).filter((t=>t&&isValidUrl(t)));return console.log(`Tìm thấy ${r.length} URL từ sitemap.`),r}function extractUrlsWithRegex(t){const e=[...t.matchAll(/<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/g)].map((t=>t[1].trim())).filter((t=>isValidUrl(t)));return console.log(`Tìm thấy ${e.length} URL bằng regex.`),e}function updateUrlInput(t){if(0===t.length)return void toast.show("Không tìm thấy URL nào trong sitemap.","warning");const e=elements.urlInput,r=new Set(e.value.split("\n").map((t=>t.trim())).filter((t=>t&&isValidUrl(t))));let n=0;t.forEach((t=>{r.has(t)||(r.add(t),n++)})),e.value=Array.from(r).join("\n"),toggleButtons.pasteButton(),toast.show(`Đã thêm ${n} URL mới vào danh sách (Tổng: ${r.size} URL).`,"success")}function isValidUrl(t){try{const e=new URL(t);return"http:"===e.protocol||"https:"===e.protocol}catch(t){return!1}}document.addEventListener("DOMContentLoaded",(()=>{toggleButtons.init(),elements.copyTableBtn.onclick=copyTable,elements.exportCsvBtn.onclick=exportCSV,document.getElementById("retryError").onclick=retryErrorUrls,elements.clearBtn.onclick=clearData,document.addEventListener("keydown",(t=>{!t.ctrlKey&&!t.metaKey||"v"!==t.key||elements.urlInput.value||pasteFromClipboard(),(t.ctrlKey||t.metaKey)&&"Enter"===t.key&&processUrls()}))}));