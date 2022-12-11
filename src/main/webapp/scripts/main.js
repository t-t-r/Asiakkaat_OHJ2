//funktio lomaketietojen muuttamiseksi JSON-stringiksi
function serialize_form(form){
	return JSON.stringify(
	    Array.from(new FormData(form).entries())
	        .reduce((m, [ key, value ]) => Object.assign(m, { [key]: value }), {})
	        );	
} 

//funktio arvon lukemiseen urlista avaimen perusteella
function requestURLParam(sParam){
    let sPageURL = window.location.search.substring(1);
    let sURLVariables = sPageURL.split("&");
    for (let i = 0; i < sURLVariables.length; i++){
        let sParameterName = sURLVariables[i].split("=");
        if(sParameterName[0] == sParam){
            return sParameterName[1];
        }
    }
}

function haeAsiakkaat(){
	let url = "asiakkaat?hakusana=" + document.getElementById("hakusana").value; 
	let requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }       
    };    
    fetch(url, requestOptions)
    .then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi 
   	.then(response => printItems(response)) 
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}

//Kirjoitetaan tiedot taulukkoon JSON-objektilistasta
function printItems(respObjList){
	console.log(respObjList);
	let htmlStr="";
	for(let item of respObjList){//yksi kokoelmalooppeista		
    	htmlStr+="<tr id='rivi_"+item.asiakas_id+"'>";
    	htmlStr+="<td>"+item.etunimi+"</td>";
    	htmlStr+="<td>"+item.sukunimi+"</td>";
    	htmlStr+="<td>"+item.puhelin+"</td>";
    	htmlStr+="<td>"+item.sposti+"</td>"; 
   		htmlStr+="<td><a href='muutaasiakas.jsp?id="+item.asiakas_id+"'>Muuta</a>&nbsp;";
		htmlStr+="<span class='poista' onclick=varmistaPoisto("+item.asiakas_id+",'"+encodeURI(item.etunimi + " " + item.sukunimi)+"')>Poista</span></td>"; //encodeURI() muutetaan erikoismerkit, välilyönnit jne. UTF-8 merkeiksi.	
    	htmlStr+="</tr>";    	
	}	
	document.getElementById("tbody").innerHTML = htmlStr;	
}

//Tutkitaan lisättävät tiedot ennen niiden lähettämistä backendiin
function tutkiJaLisaa(){
	if(tutkiTiedot()){
		lisaaTiedot();
	}
}

//Tutkitaan päivitettävät tiedot ennen niiden lähettämistä backendiin
function tutkiJaPaivita(){
	if(tutkiTiedot()){
		paivitaTiedot();
	}
}

//funktio syöttötietojen tarkistamista varten (yksinkertainen)
function tutkiTiedot(){
	let ilmo="";	
	if(document.getElementById("etunimi").value.length<2){
		ilmo="Etunimi ei kelpaa!";
		document.getElementById("etunimi").focus();	
	}else if(document.getElementById("sukunimi").value.length<2){
		ilmo="Sukunimi ei kelpaa!";
		document.getElementById("sukunimi").focus();			
	}else if(document.getElementById("puhelin").value.length<7){
		ilmo="Puhelin ei kelpaa!";	
		document.getElementById("puhelin").focus();	
	}else if(document.getElementById("sposti").value.length<8||document.getElementById("sposti").value.indexOf(".")==-1||document.getElementById("sposti").value.indexOf("@")==-1){
		ilmo="sposti ei kelpaa!";	
		document.getElementById("sposti").focus();	
	}	
	if(ilmo!=""){
		document.getElementById("ilmo").innerHTML=ilmo;
		setTimeout(function(){ document.getElementById("ilmo").innerHTML=""; }, 3000);
		return false;
	}else{
		document.getElementById("etunimi").value=siivoa(document.getElementById("etunimi").value);
		document.getElementById("sukunimi").value=siivoa(document.getElementById("sukunimi").value);
		document.getElementById("puhelin").value=siivoa(document.getElementById("puhelin").value);
		document.getElementById("sposti").value=siivoa(document.getElementById("sposti").value);	
		return true;
	}
}

//Funktio XSS-hyökkäysten estämiseksi (Cross-site scripting)
function siivoa(teksti){
	teksti=teksti.replace(/</g, "");//&lt;
	teksti=teksti.replace(/>/g, "");//&gt;	
	teksti=teksti.replace(/;/g, "");//&#59;	
	teksti=teksti.replace(/'/g, "''");//&apos;	
	return teksti;
}

//funktio tietojen lisäämistä varten. Kutsutaan backin POST-metodia ja välitetään kutsun mukana auton tiedot json-stringinä.
function lisaaTiedot(){
	let formData = serialize_form(document.lomake); //Haetaan tiedot lomakkeelta ja muutetaan JSON-stringiksi
	//formData=encodeURI(formData);
	console.log(formData);
	let url = "asiakkaat";    
    let requestOptions = {
        method: "POST", //Lisätään asiakas
        headers: { "Content-Type": "application/json; charset=UTF-8" },  //charset=UTF-8 hoitaa skandinaaviset merkit oikein backendiin
    	body: formData
    };    
    fetch(url, requestOptions)
    .then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   	.then(responseObj => {	
   		//console.log(responseObj);
   		if(responseObj.response==0){
   			document.getElementById("ilmo").innerHTML = "Asiakkaan lisäys epäonnistui.";	
        }else if(responseObj.response==1){ 
        	document.getElementById("ilmo").innerHTML = "Asiakkaan lisäys onnistui.";
			document.lomake.reset(); //Tyhjennetään lisäämisen lomake		        	
		}
		setTimeout(function(){ document.getElementById("ilmo").innerHTML=""; }, 3000);
   	})
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}

function varmistaPoisto(asiakas_id, nimi){
	if(confirm("Poista asiakas " + decodeURI(nimi) +"?")){ //decodeURI() muutetaan enkoodatut merkit takaisin normaaliksi kirjoitukseksi
		poistaAsiakas(asiakas_id, nimi);
	}
}

//Poistetaan asiakas kutsumalla backin DELETE-metodia ja välittämällä sille poistettavan asiakkaan id
function poistaAsiakas(asiakas_id, nimi){
	let url = "asiakkaat?asiakas_id=" + asiakas_id;    
    let requestOptions = {
        method: "DELETE"             
    };    
    fetch(url, requestOptions)
    .then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   	.then(responseObj => {	
   		//console.log(responseObj);
   		if(responseObj.response==0){
			alert("Asiakkaan poisto epäonnistui.");	        	
        }else if(responseObj.response==1){ 
			document.getElementById("rivi_"+asiakas_id).style.backgroundColor="red";
			alert("Asiakkaan " + decodeURI(nimi) +" poisto onnistui."); //decodeURI() muutetaan enkoodatut merkit takaisin normaaliksi kirjoitukseksi
			haeAsiakkaat();        	
		}
   	})
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}	

//Haetaan muutettavan asiakkaan tiedot. Kutsutaan backin GET-metodia ja välitetään kutsun mukana muutettavan tiedon id
function haeAsiakas() {		
    let url = "asiakkaat?asiakas_id=" + requestURLParam("id"); //requestURLParam() on funktio, jolla voidaan hakea urlista arvo avaimen perusteella. Löytyy main.js -tiedostosta 	
	//console.log(url);
    let requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" }       
    };    
    fetch(url, requestOptions)
    .then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   	.then(response => {
   		//console.log(response);
   		document.getElementById("asiakas_id").value=response.asiakas_id;
   		document.getElementById("etunimi").value=response.etunimi;
   		document.getElementById("sukunimi").value=response.sukunimi;
   		document.getElementById("puhelin").value=response.puhelin;
   		document.getElementById("sposti").value=response.sposti;
   	}) 
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}	

function paivitaTiedot(){
	let formData = serialize_form(document.lomake); //Haetaan tiedot lomakkeelta ja muutetaan JSON-stringiksi
	//formData=encodeURI(formData);
	console.log(formData);
	let url = "asiakkaat";    
    let requestOptions = {
        method: "PUT", //Lisätään asiakas
        headers: { "Content-Type": "application/json; charset=UTF-8" },  //charset=UTF-8 hoitaa skandinaaviset merkit oikein backendiin
    	body: formData
    };    
    fetch(url, requestOptions)
    .then(response => response.json())//Muutetaan vastausteksti JSON-objektiksi
   	.then(responseObj => {	
   		//console.log(responseObj);
   		if(responseObj.response==0){
   			document.getElementById("ilmo").innerHTML = "Asiakkaan päivitys epäonnistui.";	
        }else if(responseObj.response==1){ 
        	document.getElementById("ilmo").innerHTML = "Asiakkaan päivitys onnistui.";
			document.lomake.reset(); //Tyhjennetään lisäämisen lomake		        	
		}
		setTimeout(function(){ document.getElementById("ilmo").innerHTML=""; }, 3000);
   	})
   	.catch(errorText => console.error("Fetch failed: " + errorText));
}












