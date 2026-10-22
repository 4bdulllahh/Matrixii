// ASCII styles shown in the Style dropdown. To add one, add an entry here.
//   chars: the characters to draw
//   ramp:  true  -> pick the character by brightness (chars ordered dark -> light, first one is blank)
//          false -> random characters whose opacity follows brightness
//   color: the color used when "Original colors" is off
const STYLES = [
  { name: 'Matrix', chars: 'ｦｧｨｩｪｫｬｭｮｯｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789', color: '#00ff41' },
  { name: 'Binary', chars: '01', color: '#00ff41' },
  { name: 'Hex', chars: '0123456789ABCDEF', color: '#33ccff' },
  { name: 'Code', chars: '{}[]()<>/\\;:=+-*&|!?#$', color: '#c792ea' },
  { name: 'Classic ASCII', chars: ' .:-=+*#%@', ramp: true, color: '#ffffff' },
  { name: 'Detailed ASCII', chars: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$", ramp: true, color: '#ffffff' },
  { name: 'Blocks', chars: ' ░▒▓█', ramp: true, color: '#ffb000' },
  { name: 'Dots', chars: ' ·•●', ramp: true, color: '#ff5fd2' },
];
