/*
 * GlyphMenu
 *
 * A tile-view list of glyphs the user can use to add components to the graph.
 */

import {Component, OnInit, AfterViewInit} from '@angular/core';
import {GraphService} from '../graph.service';
import {GlyphService} from '../glyph.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from "@angular/material/icon";

@Component({
  selector: 'app-glyph-menu',
  templateUrl: './glyph-menu.component.html',
  styleUrls: ['./glyph-menu.component.css']
})
export class GlyphMenuComponent implements OnInit, AfterViewInit {

  public utilsDict = {};
  public sequenceFeatureDict = {};
  public miscDict = {};

  constructor(private graphService: GraphService, private glyphService: GlyphService, private sanitizer: DomSanitizer, iconRegistry: MatIconRegistry) {
  }

  onSequenceFeatureGlyphClicked(name: string) {
    this.graphService.addSequenceFeatureGlyph(name);
  }

  onMolecularSpeciesGlyphClicked(name: string) {
    this.graphService.addMolecularSpeciesGlyph(name);
  }

  ngOnInit() {
    this.registerSvgElements();
  }

  ngAfterViewInit() {
  }

  registerSvgElements() {
    const sequenceFeatureElts   = this.glyphService.getSequenceFeatureElements();
    const molecularSpeciesElts  = this.glyphService.getMolecularSpeciesElements();
    const interactionElts       = this.glyphService.getInteractionElements();
    const utilElts              = this.glyphService.getUtilElements();

    for (const name in sequenceFeatureElts) {
      const svg = sequenceFeatureElts[name];

      this.sequenceFeatureDict[name] = this.sanitizer.bypassSecurityTrustHtml(svg.innerHTML);
    }

    for (const name in utilElts) {
      const svg = utilElts[name];
      this.utilsDict[name] = this.sanitizer.bypassSecurityTrustHtml(svg.innerHTML);
    }
    // For now combine interactions and molecular species into the miscellaneous
    for (const name in molecularSpeciesElts) {
      const svg = molecularSpeciesElts[name];
      this.miscDict[name] = this.sanitizer.bypassSecurityTrustHtml(svg.innerHTML);
    }
    for (const name in interactionElts) {
      const svg = interactionElts[name];
      this.miscDict[name] = this.sanitizer.bypassSecurityTrustHtml(svg.innerHTML);
    }
  }

  addStrand() {
    this.graphService.addNewBackbone();
  }

  addTextBox() {
    this.graphService.addTextBox();
  }

  addInteraction() {
    this.graphService.addInteraction();
  }

}
