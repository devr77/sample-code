const catchAsync = require("./catchAsync");
var os = require("os");
var osu = require("node-os-utils");


// https://stackoverflow.com/questions/71966057/how-to-get-server-cpu-and-memory-and-disk-percentage-in-node-js
// https://www.npmjs.com/package/check-disk-space
// https://stackoverflow.com/questions/36816181/get-view-memory-cpu-usage-via-nodejs

exports.Metrics = catchAsync(async (req, res, next) => {
  var cpu = osu.cpu;
  let cpuPercentage = await cpu.usage();
  var mem = osu.mem;
  var RamMemInfo = await mem.info();
  var netstat = osu.netstat;
  var netstatInfo = await netstat.stats();
  var drive = osu.drive;
  // var driveInfo = await drive.info();
  res.status(200).send({
    arch: os.arch(),
    platform: os.platform(),
    userInfo: os.userInfo(),
    tempDir: os.tmpdir(),
    hostMachine: os.hostname(),
    machine: os.machine(),
    cpuUsage: process.cpuUsage(),
    cpuModel: osu.cpu.model(),
    cpuCount: osu.cpu.count(),
    cpuPercentage: cpuPercentage,
    upTime: os.uptime() / 3600,
    RamMemInfo: RamMemInfo,
    memoryUsage: process.memoryUsage(),
    Ip: osu.os.ip(),
    OupTime: osu.os.uptime(),
    cpuAvg: osu.cpu.average(),
    netstatInfo: netstatInfo,
    resourceUsage: process.resourceUsage(),
    // driveInfo: driveInfo,
    loadAvg: os.loadavg(),
    NetworkInterFace: os.networkInterfaces(),
    constants: os.constants,
    cpu: os.cpus(),
  });
});
