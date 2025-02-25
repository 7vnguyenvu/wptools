const toggleButtons={inputRelatedButtons:()=>{const t=document.getElementById("pasteButton"),e=document.getElementById("clear"),n=document.getElementById("jsonInput").value.trim().length>0;t&&(t.style.display=n?"none":"inline-block"),e&&(e.style.display=n?"inline-block":"none")},actionButtons:t=>{[document.getElementById("copyTableBtn"),document.getElementById("exportCsvBtn")].forEach((e=>{e&&(e.style.display=t?"inline-block":"none")}))},init:()=>{toggleButtons.actionButtons(!1),toggleButtons.inputRelatedButtons()}};function showToast(t,e="success"){const n=document.querySelector(".toast-container"),o=document.createElement("div");o.className=`toast ${e}`,o.textContent=t,n.appendChild(o),o.offsetHeight,setTimeout((()=>o.classList.add("show")),10),setTimeout((()=>{o.classList.remove("show"),setTimeout((()=>n.removeChild(o)),300)}),3e3)}function getCleanHeaderText(t){const e=t.querySelector(".header-content");if(e){const t=e.cloneNode(!0),n=t.querySelector(".header-copy-btn");return n&&n.remove(),t.textContent.trim()}return t.textContent.trim()}function copyColumnData(t){const e=document.getElementById("resultTable"),n=Array.from(e.rows).slice(1).map((e=>e.cells[t].textContent.trim())).join("\n");navigator.clipboard.writeText(n).then((()=>{const n=e.querySelector(`th:nth-child(${t+1})`).querySelector(".header-copy-btn"),o=n.style.cssText,r=n.textContent;n.textContent="Copied!",n.style.backgroundColor="#90EE90",n.style.borderColor="#4CAF50",setTimeout((()=>{n.textContent=r,n.style.cssText=o}),1e3),showToast("Đã sao chép thành công!")})).catch((t=>{showToast("Không thể sao chép. Vui lòng thử lại.","error")}))}function createHeaderCopyButton(t){const e=document.createElement("button");return e.className="header-copy-btn",e.innerHTML="Copy",e.style.cssText="\n                margin-left: .5rem;\n                cursor: pointer;\n                background: #f0f0f0;\n                border: 1px solid #ddd;\n                border-radius: 3px;\n                padding: 2px 6px;\n                font-size: 12px;\n                opacity: 0.8;\n                transition: all 0.2s ease;\n            ",e.onmouseover=()=>{e.style.opacity="1",e.style.backgroundColor="#e0e0e0"},e.onmouseout=()=>{e.style.opacity="0.8",e.style.backgroundColor="#f0f0f0"},e.onclick=e=>{e.stopPropagation(),copyColumnData(t)},e}async function pasteFromClipboard(){try{const t=await navigator.clipboard.readText();document.getElementById("jsonInput").value=t,toggleButtons.inputRelatedButtons(),showToast("Đã dán nội dung thành công!")}catch(t){showToast("Không thể truy cập clipboard. Vui lòng dán thủ công.","error")}}function getCategoryLevels(t){const e=determineType(t),n=getDisplayName(t);let o=[];if("category"===e||"post"===e){o=["Tin tức"];const e=(t.category||t.category_name||"").trim();return e&&o.push(e),Array.from({length:5},((t,e)=>o[e]||""))}if("collection"===e)return o=["Bộ sưu tập",n.trim()],Array.from({length:5},((t,e)=>o[e]||""));const r={"Thời trang nữ":{"ÁO DÀI":{},"Áo Nữ":{"Áo Khoác Nữ":{"Áo Hoodie":{}},"Áo Kiểu":{"Áo 2 Dây":{},"Áo Sát Nách":{}},"Áo Len":{}},"Áo Sơ Mi":{"Áo Sơ Mi Nữ Tay Ngắn":{},"Áo Sơ Mi Nữ Tay Dài":{},"Áo Sơ Mi Họa Tiết":{},"Áo Sơ Mi Kiểu":{}},"Áo Thun":{"Áo Thun Nữ Cổ Tròn":{},"Áo Thun Nam Cổ Tròn":{},"Áo Thun Nữ Polo":{},"Áo thun nữ":{}},"Áo Vest & Blazer":{},"Chân Váy":{"Chân Váy Xẻ":{},"Chân Váy Xòe":{},"Chân Váy Bút Chì":{},"Chân Váy Xếp Ly":{},"Chân Váy Chữ A":{},"Chân Váy Jean":{}},"Giày Dép Nữ":{},"Quần Dài":{"Quần Jeans Nữ":{},"Quần Tây Ống Suông":{},"Quần Tây Ống Rộng":{},"Quần Tây Ống Đứng":{},"Quần Tây Công Sở":{}},"Quần Short":{},"Sản Phẩm Bigsize":{},"Váy Đầm":{"Váy Đầm Bút Chì":{},"Váy Đầm Xếp Ly":{},"Váy Đầm Xòe":{},Jumpsuit:{},"Váy Đầm Sơ Mi":{},"Váy Đầm Form A":{},"Váy Đầm Vest":{},"Váy Đầm Dự Tiệc":{},"Váy Đầm Công Sở":{}}},"Váy Nữ":{},"Quần Short Nam":{},"Áo Thun Nam":{},SET:{},Gmorning:{"Váy Đầm Gmorning":{},"Chân Váy Gmorning":{},"Áo Sơ Mi Gmorning":{},"Áo Thun Gmorning":{},"Quần Dài Gmorning":{"Quần Jeans Gmorning":{}},"Áo Khoác Gmorning":{},"Áo Vest/Blazer Gmorning":{},"Quần Short Gmorning":{}}};function a(t,e,n=[]){if(e in t)return[...n,e];for(const[o,r]of Object.entries(t)){const t=a(r,e,[...n,o]);if(t)return t}return null}if("product"===e||"product_cat"===e){const c="product"===e?(t.category||"").trim():n.trim();for(const[t,e]of Object.entries(r)){const n=a({[t]:e},c);if(n){o=n;break}}}return Array.from({length:5},((t,e)=>o[e]||""))}function determineType(t){if(t.action){const e=(new DOMParser).parseFromString(t.action,"text/html").querySelector(".btn-edit");if(e){const t=e.getAttribute("href");if(t.includes("/pages/"))return"page";if(t.includes("/categories/"))return"category";if(t.includes("/product-categories/"))return"product_cat";if(t.includes("/posts/"))return"post";if(t.includes("/collections/"))return"collection"}}return"product"}function getDisplayName(t){return t.crm_name||t.title||t.name||t.display_name||""}function getCmsLink(t){const e=t.id;switch(determineType(t)){case"page":return`https://cms.gumac.vn/pages/${e}/edit`;case"category":return`https://cms.gumac.vn/categories/${e}/edit`;case"product_cat":return`https://cms.gumac.vn/product-categories/${e}/edit`;case"post":return`https://cms.gumac.vn/posts/${e}/edit`;case"collection":return`https://cms.gumac.vn/collections/${e}/edit`;default:return`https://cms.gumac.vn/products/${e}/edit`}}const SLUG_REPLACEMENTS={"ao-so-mi-hoa-tiet":"ao-so-mi-nu-hoa-tiet","quan-tay-ong-suong":"quan-tay-nu-ong-suong","quan-tay-ong-dung":"quan-tay-nu-ong-dung","quan-tay-ong-rong":"quan-tay-nu-ong-rong","quan-tay-cong-so":"quan-tay-nu-cong-so","quan-jeans-nu":"quan-dai-jean","ao-so-mi-kieu":"ao-so-mi-nu-kieu","ao-vest-blazer":"ao-vest","vay-dam-xep-ly":"dam-xep-ly"},URL_PATTERNS={page:(t,e)=>`${t}/${e}`,category:(t,e)=>`${t}/tin-tuc?category=${e}`,post:(t,e)=>`${t}/tin-tuc/${e}`,collection:(t,e)=>`${t}/bo-suu-tap/${e}`,product_cat:(t,e)=>`${t}/${e}`,product:(t,e,n)=>`${t}/${e}/${n}`};function toSlug(t){return t?t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[đĐ]/g,"d").replace(/[^a-zA-Z0-9\s]/g,"").replace(/\s+/g,"-"):""}function processCategoryPath(t){if(!t)return"";const e=toSlug(t);return SLUG_REPLACEMENTS[e]||e}function getUrl(t,e){const n="https://gumac.vn",o=t.slug||"";if(!e||!o)return"";const r=URL_PATTERNS[e];if(!r)return"";if("product"===e){const e=getCategoryLevels(t);console.log("categoryLevels",e);const a=e.filter((t=>t)).at(-1);console.log("lastCategory",a);return r(n,processCategoryPath(a),o)}return r(n,o)}function processJson(){const t=document.getElementById("jsonInput").value;if(t.trim())try{const e=t.split(/}\s*{/).map(((e,n)=>(n>0&&(e="{"+e),n<t.split(/}\s*{/).length-1&&(e+="}"),JSON.parse(e)))),n=document.querySelector("#resultTable tbody");n.innerHTML="";let o=0;const r=document.querySelector("#resultTable thead tr");r.querySelectorAll(".header-copy-btn").forEach((t=>t.remove()));const a=new Array(11).fill(!1);e.forEach((t=>{t.data&&Array.isArray(t.data)&&t.data.forEach((t=>{if(t.active){const e=getCategoryLevels(t),r=determineType(t),c=getCmsLink(t),s=getDisplayName(t),u=getUrl(t,r),i=n.insertRow();[o+1,u,s,r,t.id,c,...e].forEach(((t,e)=>{t&&(a[e]=!0);const n=i.insertCell();if(1===e){const e=document.createElement("a");e.href=t,e.target="_blank",e.rel="noopener noreferrer",e.textContent=t,n.appendChild(e)}else if(3===e){const e=document.createElement("span");e.className="type-label",e.textContent=t,n.appendChild(e)}else if(5===e){const e=document.createElement("a");e.href=t,e.target="_blank",e.rel="noopener noreferrer",e.textContent=t,n.appendChild(e)}else n.textContent=t})),o++}}))}));r.querySelectorAll("th").forEach(((t,e)=>{if(a[e]){const n=document.createElement("div");n.className="header-content",n.textContent=t.textContent;const o=createHeaderCopyButton(e);n.appendChild(o),t.textContent="",t.appendChild(n)}})),o>0?(toggleButtons.actionButtons(!0),showToast("Đã xử lý dữ liệu thành công!")):(toggleButtons.actionButtons(!1),showToast("Không tìm thấy dữ liệu hợp lệ trong nội dung JSON","error"))}catch(t){console.error("Error processing JSON:",t),toggleButtons.actionButtons(!1),showToast("Lỗi khi xử lý JSON. Vui lòng kiểm tra định dạng đầu vào.","error")}else showToast("Vui lòng dán nội dung JSON vào textarea","error")}document.getElementById("copyTableBtn").addEventListener("click",(function(){const t=document.getElementById("resultTable"),e=Array.from(t.rows).map((t=>Array.from(t.cells).map((t=>t.querySelector("button")?getCleanHeaderText(t):t.textContent.trim())).join("\t"))).join("\n");navigator.clipboard.writeText(e).then((()=>{const e=t.querySelector("tbody");e.style.backgroundColor="#61ff5540",setTimeout((()=>{e.style.backgroundColor=""}),700),showToast("Đã sao chép toàn bộ bảng thành công!")})).catch((t=>{showToast("Không thể sao chép. Vui lòng thử lại.","error")}))})),document.getElementById("exportCsvBtn").addEventListener("click",(function(){const t=document.getElementById("resultTable"),e=Array.from(t.querySelectorAll("thead th")).map((t=>getCleanHeaderText(t))),n=Array.from(t.querySelectorAll("tbody tr")).map((t=>Array.from(t.querySelectorAll("td")).map((t=>`"${t.textContent.trim().replace(/"/g,'""')}"`)).join(","))),o="data:text/csv;charset=utf-8,"+[e.join(","),...n].join("\n"),r=encodeURI(o),a=document.createElement("a");a.setAttribute("href",r),a.setAttribute("download","data.csv"),document.body.appendChild(a),a.click(),document.body.removeChild(a),showToast("Đã xuất file CSV thành công!")})),document.getElementById("clear").addEventListener("click",(function(){document.getElementById("jsonInput").value="",document.querySelector("#resultTable tbody").innerHTML="",toggleButtons.actionButtons(!1),toggleButtons.inputRelatedButtons(),showToast("Đã làm mới dữ liệu!")})),document.getElementById("jsonInput").addEventListener("input",(()=>{toggleButtons.inputRelatedButtons()})),document.addEventListener("DOMContentLoaded",toggleButtons.init);