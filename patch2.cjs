const fs = require('fs');
const file = 'src/components/simulation/ClusteringSimulation.tsx';
let code = fs.readFileSync(file, 'utf8');

// Normalize newlines to \n
code = code.replace(/\r\n/g, '\n');

// 1. We remove the unwanted wrapper tags at line ~564
code = code.replace(
  '          {/* RIGHT — table + groups */}\n          <div className="lg:col-span-2 flex flex-col gap-6">\n            {/* mini data table */}',
  '            {/* mini data table */}'
);

// We find the groups block (current groups) and extract it
const gStart = code.indexOf('            {/* current groups */}');
const gEnd = code.indexOf('              </div>\n            </div>\n          </div>\n        </div>', gStart);

let groupsContent = code.substring(gStart, gEnd + 36); // up to the end of the groups div

// Remove groups block and the extra closing tags from the code
code = code.substring(0, gStart) + code.substring(gEnd + 67);

// We find the dendro block and extract it
const dStart = code.indexOf('        {/* Dendrogramme */}');
const dEnd = code.indexOf('          </p>\n        </div>', dStart);

let dendroContent = code.substring(dStart, dEnd + 29); // up to the end of the div

// Remove dendro block from the code
code = code.substring(0, dStart) + code.substring(dEnd + 30);

// At this point, the code is missing the end of Left Column, the Right Column, Dendrogramme, Groups, and the end of Grid.
// We inject them just before `        {/* Method explanation */}`

const methodExplStart = code.indexOf('        {/* Method explanation */}');

const injection = `          </div>

          {/* RIGHT COLUMN */}
          <div className="flex flex-col gap-6">
${dendroContent.replace(/^        /gm, '            ')}

${groupsContent.replace(/^            /gm, '            ')}
          </div>
        </div>

`;

code = code.substring(0, methodExplStart) + injection + code.substring(methodExplStart);

fs.writeFileSync(file, code);
console.log("Patched layout successfully!");
