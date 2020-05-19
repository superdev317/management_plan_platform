import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaginationMethods } from 'app/elements/pagination/paginationMethods';
import { NgbRatingConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { RecruitmentService } from 'app/projects/recruitment.service';
import { HireEmployeeModel } from 'app/projects/models/HireEmployeeModel';
import { HireEmployeeData } from 'app/projects/models/ScheduleInterviewModel';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TerminationLetterComponent } from '../termination-letter/termination-letter.component';
import { DocuSigndocpreviewComponent } from 'app/founder/projects/employee-profile/docu-signdocpreview/docu-signdocpreview.component';

@Component({
  selector: 'app-my-employee',
  templateUrl: './my-employee.component.html',
  styleUrls: ['./my-employee.component.css'],
  providers: [PaginationMethods, NgbRatingConfig]
})
export class MyEmployeeComponent implements OnInit {
  @Input() projectId: number;
  private employees: HireEmployeeModel[];
  pageSize = 5;
  count: number;
  searchText: '';
  flagFired: boolean = false;
  popUpForDocuSignModalRef: NgbModalRef;

  constructor(private paginationMethods: PaginationMethods,
    private recruitmentService: RecruitmentService,
    private router: Router,
    private route: ActivatedRoute,
    config: NgbRatingConfig,
    private modalService: NgbModal) {
      config.max = 5;
      config.readonly = true;
  }
  ngOnInit() {
  }

  getMyEmpoloyeeList(newPage) {
    if (newPage) {
      this.recruitmentService.myEmployeeList(newPage, this.pageSize, this.searchText)
        .subscribe((empJob: HireEmployeeModel[]) => {
          this.employees = empJob['results'];
          this.count = empJob['count'];
          console.log(`this.employees`);
          console.log(this.employees);
        });
    }
  }
  valueChange() {
    if (this.searchText.length > 2 || this.searchText == '') {
      this.getMyEmpoloyeeList(1);
    }
  }
  pay(emp: HireEmployeeModel) {
    this.router.navigate(['founder/projects/' + this.projectId + '/recruitment/' + emp.id + '/pay']);
  }
  fire(emp: any) {
    const modalRef = this.modalService.open(TerminationLetterComponent, {
      size: 'lg',
      windowClass: 'appoitmentmodel'
    });
    modalRef.componentInstance.emp = emp;
    modalRef.componentInstance.projectId = this.projectId;
    modalRef.componentInstance.emitService.subscribe((emmitedValue) => {
      this.flagFired = emmitedValue;
      this.getMyEmpoloyeeList(1);
    });
  }

  metrices(emp: HireEmployeeModel) {
    this.router.navigate(['founder/projects/' + this.projectId + '/recruitment/' + emp.id + '/ProcessesWorkedOn']);
  }

  getProfile(empId: any) {
    this.router.navigate(['founder/projects/' + this.projectId + '/recruitment/' + empId + '/profile']);
  }

  checkDocuSign(emp: any, template) {
    this.recruitmentService.getDocuSignStatus(emp.id, emp.rehire_envelop).subscribe((obj) => {
      if (obj && obj.status && obj.status != '') {
        this.popUpForDocuSignModalRef = this.modalService.open(template, { backdrop: false });
      }
      else {
        const modalRef = this.modalService.open(DocuSigndocpreviewComponent, {
          size: 'lg',
          windowClass: 'appoitmentmodel'
        });
        modalRef.componentInstance.URL = obj.url;
      }
    });
  }
}
