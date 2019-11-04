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
		// parameters for the different methods
		String authorization = request.getHeader("Authorization");
		String email = null;
		String password = null;
		String user = null;
		if(authorization != null && authorization.split(":").length > 1) {
			String[] tokens = authorization.split(":");
			email = tokens[0];
			password = tokens[1];
		}else {
			user = authorization;
		}
		String server = request.getParameter("server");
		
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
			body = user;
			
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
				LinkedList<String> collectionURLs = new LinkedList<String>();
				for(IdentifiedMetadata collection: collections) {
					collectionURLs.add(collection.getUri());
				}
				body = gson.toJson(collectionURLs);
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
		
		String server = request.getParameter("server");
		String user = request.getHeader("Authorization");
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