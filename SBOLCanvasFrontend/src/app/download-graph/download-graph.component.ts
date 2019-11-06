import { Component, OnInit, ViewChild } from '@angular/core';
import { LoginService } from '../login.service';
import { MatDialogRef, MatSort, MatTableDataSource } from '@angular/material';
import { FilesService } from '../files.service';
import { GraphService } from '../graph.service';
import { MetadataService } from '../metadata.service';

@Component({
  selector: 'app-download-graph',
  templateUrl: './download-graph.component.html',
  styleUrls: ['./download-graph.component.css']
})
export class DownloadGraphComponent implements OnInit {

  registries: string[];
  registry: string;
  partTypes: string[];
  history: any[];
  partRoles: string[];
  roleRefinements: string[];

  collection: string;
  partType: string;
  partRole: string;
  partRefine: string;

  parts = new MatTableDataSource([]);
  part: string;

  displayedColumns: string[] = ['type', 'displayId', 'name', 'version', 'description'];
  @ViewChild(MatSort) sort: MatSort;

  working: boolean;

  constructor(private metadataService: MetadataService, private graphService: GraphService, private filesService: FilesService, private loginService: LoginService, public dialogRef: MatDialogRef<DownloadGraphComponent>) { }

  ngOnInit() {
    this.working = true;
    let registryQuery = true;
    let typesQuery = true;
    let rolesQuery = true;

    this.filesService.getRegistries().subscribe(registries => {
      this.registries = registries;
      registryQuery = false;
      this.working = registryQuery || typesQuery || rolesQuery;
    });
    this.metadataService.loadTypes().subscribe(partTypes => {
      this.partTypes = partTypes;
      typesQuery = false;
      this.working = registryQuery || typesQuery || rolesQuery;
    });
    this.metadataService.loadRoles().subscribe(partRoles => {
      this.partRoles = partRoles;
      rolesQuery = false;
      this.working = registryQuery || typesQuery || rolesQuery;
    });
    this.updateParts();
    this.parts.sort = this.sort;
  }

  loginDisabled(): boolean{
    return this.loginService.users[this.registry] != null || this.registry == null;
  }

  finishCheck(): boolean{
    return true;
  }

  applyFilter(filterValue: string){
    this.parts.filter = filterValue.trim().toLowerCase();
  }

  setRegistry(registry: string){
    this.registry = registry;
    this.updateParts();
  }

  setPartRole(partRole: string){
    this.partRole = partRole;
    this.partRefine = null;
    this.updateRefinements();
  }

  onLoginClick(){
    this.loginService.openLoginDialog(this.registry).subscribe(result => {
      if(result){
        this.updateParts();
      }
    });
  }

  onCancelClick(){
    this.dialogRef.close();
  }

  updateRefinements(){
    this.working = true;
    this.metadataService.loadRefinements(this.partRole).subscribe(refinements => {
      this.roleRefinements = refinements;
      this.working = false;
    });
  }

  updateParts(){
    if(this.registry != null){
      this.working = true;
      let collectionQuery = true;
      let partQuery = true;
      let roleOrRefine = this.partRefine != null && this.partRefine.length > 0 ? this.partRefine : this.partRole;
      this.parts.data = [];
      let partCache = [];
      this.filesService.listParts(this.loginService.users[this.registry], this.registry, this.collection, roleOrRefine, this.partRole, "collections").subscribe(collections => {
        collections.forEach(element => {
          element.type = "collection";
          partCache.push(element);
        });
        this.parts.data = partCache;
        collectionQuery = false;
        this.working = false;//partQuery;
      });
      // this.filesService.listParts(this.loginService.users[this.registry], this.registry, this.collection, this.partType, this.partRole, "parts").subscribe(parts => {
      //   parts.forEach(element => {
      //     element.type = "part";
      //     this.parts.data.push(element);
      //   });
      //   partQuery = false;
      //   this.working = collectionQuery;
      // });
    }else{
      this.parts.data = [];
    }
  }

}
