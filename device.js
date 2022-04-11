// import { machineId, machineIdSync } from 'node-machine-id';

// // Asyncronous call with async/await or Promise

// async function getMachineId() {
//     let id = await machineId().catch((err) => { return err })
//     return id
// }
// machineId().then((id) => {
//     document.getElementById("machine-id").textContent += id;
// }).catch((err) => {
//     return document.getElementById("machine-id").textContent += err
// })

const btn = document.getElementById('btn')
const machineIdEle = document.getElementById('machine-id')

window.addEventListener('load', async () => {
  const machineId = await window.electronAPI.fetchMachineId()
  machineIdEle.innerText = machineId
});

document.getElementById('open-in-browser').addEventListener('click', () => {
    shell.open();
  });