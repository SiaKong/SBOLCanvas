package servlets;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.util.LinkedList;
import java.util.List;

import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.io.IOUtils;
import org.apache.http.HttpStatus;
import org.synbiohub.frontend.IdentifiedMetadata;
import org.synbiohub.frontend.SynBioHubException;
import org.synbiohub.frontend.SynBioHubFrontend;
import org.synbiohub.frontend.WebOfRegistriesData;

import com.google.gson.Gson;

import utils.Converter;

@SuppressWarnings("serial")
@WebServlet(urlPatterns = {"/SynBioHub/*"})
public class SynBioHub extends HttpServlet {
	
	protected void doGet(HttpServletRequest request, HttpServletResponse response) {
		Gson gson = new Gson();
		String body = null;
		response.addHeader("Access-Control-Allow-Origin", "*");
		
		// parameters for the different methods
		String email = request.getParameter("email");
		String password = request.getParameter("password");
		String server = request.getParameter("server");
		String user = request.getParameter("user");
		
		if(request.getPathInfo().equals("/registries")) {
			
			List<WebOfRegistriesData> registries = null;
			try {
				registries = SynBioHubFrontend.getRegistries();
			} catch (SynBioHubException e) {
				e.printStackTrace();
			}
			LinkedList<String> registryURLs = new LinkedList<String>();
			for(WebOfRegistriesData registry : registries) {
				registryURLs.add(registry.getInstanceUrl());
			}
			body = gson.toJson(registryURLs);
			
		}else if(request.getPathInfo().equals("/login")) {
			
			if(email == null || password == null || server == null || email.equals("") || password.equals("") || server.equals("")) {
				response.setStatus(HttpStatus.SC_BAD_REQUEST);
				return;
			}
			SynBioHubFrontend sbhf = new SynBioHubFrontend(server);
			try {
				sbhf.login(email, password);
			} catch (SynBioHubException e) {
				e.printStackTrace();
			}
			user = sbhf.getUser();
			body = gson.toJson(user);
			
		}else if(request.getPathInfo().equals("/listMyCollections")){
			
			if(server == null || user == null) {
				response.setStatus(HttpStatus.SC_BAD_REQUEST);
				return;
			}
			SynBioHubFrontend sbhf = new SynBioHubFrontend(server);
			try {
				sbhf.setUser(user);
				List<IdentifiedMetadata> collections = sbhf.getRootCollectionMetadata();
				collections.removeIf(collection -> (collection.getUri().contains("/public/")));
				body = gson.toJson(collections);
			} catch (SynBioHubException e) {
				e.printStackTrace();
			}
			
		}
		
		try {
			ServletOutputStream outputStream = response.getOutputStream();
			InputStream inputStream = new ByteArrayInputStream(body.getBytes());
			IOUtils.copy(inputStream, outputStream);
			
			// the request was good
			response.setStatus(HttpStatus.SC_OK);
			response.setContentType("application/json");
			return;
		} catch (IOException e) {
			e.printStackTrace();
		}
	}
	
	protected void doPost(HttpServletRequest request, HttpServletResponse response) {
		response.addHeader("Access-Control-Allow-Origin", "*");
		
		String server = request.getParameter("server");
		String user = request.getParameter("user");
		String uri = request.getParameter("uri");
		String name = request.getParameter("name");
		
		if(request.getPathInfo().equals("/addToCollection")){
			
			if(server == null || user == null || uri == null || name == null) {
				response.setStatus(HttpStatus.SC_BAD_REQUEST);
				return;
			}
			SynBioHubFrontend sbhf = new SynBioHubFrontend(server);
			sbhf.setUser(user);
			Converter converter = new Converter();
			ByteArrayOutputStream out = new ByteArrayOutputStream();
			try {
				converter.toSBOL(request.getInputStream(), out, name);
				sbhf.addToCollection(URI.create(uri), true, new ByteArrayInputStream(out.toByteArray()));
			} catch (IOException | SynBioHubException e) {
				e.printStackTrace();
			}
			response.setStatus(HttpStatus.SC_CREATED);
			
		}
		
	}
	
}
