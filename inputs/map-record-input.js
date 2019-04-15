import mockServer from 'lib/mock-server';
import endpointMap from 'mock-server-endpoints';

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

mockServer.mapRecord(
  endpointMap.organizationPromotions,
  this.companyId,
  {
    'elements.0.widget': 'contentsuggestionswidget',
    'elements.0.legoTrackingToken': 'abc123'
  }
);

mockServer.mapRecord(
  endpointMap.organizationCompanies,
  '1000',
  'test'
);


mockServer.mapRecordToCustomResponse(
  endpointMap.organizationCompanies,
  '1000',
  'test'
);
