import mockServer from 'voyager-test-helpers/organization/mock-server';
import endpointMap from 'voyager-test-helpers/organization/mock-server-endpoints';

mockServer.mapRecord(
  endpointMap.organizationCompanies,
  this.companyId,
  createCompanyWithAdminAccess({
    companyIndustries: [],
    entityUrn: this.companyUrn,
    followingInfo: PDSCMocker.create('common/following-info').with({
      following: false,
      followerCount: 100,
    }),
  })
);
