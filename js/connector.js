import {ethers} from './ethers-5.1.esm.min.js'
import { abi,sepoliaContractAddress } from './constants.js';

const connectButton = document.getElementById('connect');
const donateButton = document.getElementById('donate');
const receiveButton = document.getElementById('receive');

connectButton.onclick=connect;
donateButton.onclick=donate;
receiveButton.onclick=receive;

async function connect(){
    if(typeof window.ethereum!=="undefined"){
        await window.ethereum.request({method: "eth_requestAccounts"})
        .then(console.log('connected'));
    }else{
        window.alert("couldn't find metamask. Please check if you've installed it");
    }
}

async function donate(){
    console.log('donating...');

    const dname=document.getElementById('don-name').value;
    const age=document.getElementById('don-age').value;
    const locality=document.getElementById('don-locality').value;
    const bloodType=document.getElementById('don-bloodType').value;
    const organ=document.getElementById('don-organ').value;
    const organLife=document.getElementById('don-organLife').value;
    const hospital=document.getElementById('don-hospital').value;

    if(typeof window.ethereum!=="undefined"){
        //provider
        //signer
        //contract(abi + address)
        
        const provider= new ethers.providers.Web3Provider(window.ethereum);
        const signer= provider.getSigner();
        const contract= new ethers.Contract(sepoliaContractAddress,abi,signer);
        try {
            console.log(dname);
            console.log(age);
            console.log(locality);
            console.log(bloodType);
            console.log(organ);
            console.log(organLife);
            console.log(hospital);
            const transactionResponse = await contract.createNewDonor(dname,age,locality,bloodType,organ,organLife,hospital)
            console.log(signer);
            await listForTransaction(transactionResponse,provider);
            console.log(`done!`);
        } catch (error) {
            console.log(error);
        }
        
    }
}

function listForTransaction(transactionResponse, provider){ 
    //returning as a promise here, otherwise other
    //statements in main control flow will exec 
    //b4 provider.once() fires
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject)=>{
        provider.once(transactionResponse.hash, (transactionReceipt)=>{
            console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
            resolve();
        });
    })
    
}

async function receive(){
    console.log('retrieving matches...');
    const rname=document.getElementById('rec-name').value;
    const age=document.getElementById('rec-age').value;
    const locality=document.getElementById('rec-locality').value;
    const bloodType=document.getElementById('rec-bloodType').value;
    const organ=document.getElementById('rec-organ').value;
    const hospital=document.getElementById('rec-hospital').value;
    if(typeof window.ethereum!=="undefined"){
        const provider= new ethers.providers.Web3Provider(window.ethereum);
        const signer=provider.getSigner();
        const contract = new ethers.Contract(sepoliaContractAddress,abi,signer);

        try {
            const createRecTransactionResponse = await contract.createNewRecipient(rname,age,locality,bloodType,organ,hospital)
            console.log(signer);
            await listForTransaction(createRecTransactionResponse,provider);
            console.log(`done creating new recipient!`);

            const viewDonTransactionResponse = await contract.retrieveDonors()
            console.log(viewDonTransactionResponse)
            //await listForTransaction(viewDonTransactionResponse,provider);
            const display= document.getElementById('allDonors');
            for(var i=0;i<viewDonTransactionResponse.length;i++){
                display.append(viewDonTransactionResponse[i]);
                display.append(document.createElement("br"));
            }
            console.log(`done showing all donors!`);
        } catch (error) {
            console.log(error);
        }
    }
}