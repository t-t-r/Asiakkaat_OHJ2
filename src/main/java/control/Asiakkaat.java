package control;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.stream.Collectors;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import model.Asiakas;
import model.dao.Dao;

@WebServlet("/asiakkaat/*")
public class Asiakkaat extends HttpServlet {
	private static final long serialVersionUID = 1L;
       
   
    public Asiakkaat() {
        System.out.println("Asiakkaat.Asiakkaat()");
    }
	//Haku
	protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("Asiakkaat.doGet()");
		String hakusana = request.getParameter("hakusana");
		String asiakas_id = request.getParameter("asiakas_id");
		String strJSON = "";
		Dao dao = new Dao();
		ArrayList<Asiakas> asiakkaat = dao.getAllItems();
		if(hakusana!=null) {//Jos kutsun mukana tuli hakusana
			if(!hakusana.equals("")) {//Jos hakusana ei ole tyhjä
				asiakkaat = dao.getAllItems(hakusana); //Haetaan kaikki hakusanan mukaiset autot							
			}else {
				asiakkaat = dao.getAllItems(); //Haetaan kaikki asiakkaat
			}
			strJSON = new Gson().toJson(asiakkaat);	
		}else if(asiakas_id!=null) {
			Asiakas asiakas = dao.getItem(Integer.parseInt(asiakas_id));
			strJSON = new Gson().toJson(asiakas);
		}else {
			asiakkaat = dao.getAllItems(); //Haetaan kaikki asiakkaat
			strJSON = new Gson().toJson(asiakkaat);	
		}	
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		out.println(strJSON);		
	}
	
	//Lisäys
	protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("Asiakkaat.doPost()");
		//Luetaan JSON-tiedot POST-pyynnön bodysta ja luodaan niiden perusteella uusi asiakas		
		String strJSONInput = request.getReader().lines().collect(Collectors.joining());
		//System.out.println(strJSONInput);
		Asiakas asiakas = new Gson().fromJson(strJSONInput, Asiakas.class);	
		//System.out.println(asiakas);
		Dao dao = new Dao();
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		if(dao.addItem(asiakas)) {
			out.println("{\"response\":1}");  //Auton lisääminen onnistui {"response":1}
		}else {
			out.println("{\"response\":0}");  //Auton lisääminen epäonnistui {"response":0}
		}		
	}
	
	//Muutos
	protected void doPut(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("Asiakkaat.doPut()");
		//Luetaan JSON-tiedot POST-pyynnön bodysta ja luodaan niiden perusteella uusi asiakas		
		String strJSONInput = request.getReader().lines().collect(Collectors.joining());
		//System.out.println(strJSONInput);
		Asiakas asiakas = new Gson().fromJson(strJSONInput, Asiakas.class);	
		//System.out.println(asiakas);
		Dao dao = new Dao();
		response.setContentType("application/json; charset=UTF-8");
		PrintWriter out = response.getWriter();
		if(dao.changeItem(asiakas)) {
			out.println("{\"response\":1}");  //Auton lisääminen onnistui {"response":1}
		}else {
			out.println("{\"response\":0}");  //Auton lisääminen epäonnistui {"response":0}
		}		
	}
	
	//Poisto
	protected void doDelete(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
		System.out.println("Asiakkaat.doDelete()");
		int asiakas_id = Integer.parseInt(request.getParameter("asiakas_id"));
		Dao dao = new Dao();
		response.setContentType("application/json");
		PrintWriter out = response.getWriter();		    
		if(dao.removeItem(asiakas_id)){ //metodi palauttaa true/false
			out.println("{\"response\":1}"); //Asiakkaan poisto onnistui {"response":1}
		}else {
			out.println("{\"response\":0}"); //Asiakkaan poisto epäonnistui {"response":0}
		}	
	}

}
