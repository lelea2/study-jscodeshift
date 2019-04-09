PretenderManager.setResponseMock(
  'get',
  addQueryParams(`/voyager/api/organization/companies/${this.companyId}`, {
    decorationId:
      recipes['com.linkedin.voyager.deco.organization.web.WebCompanyAdmin'],
  }),
  handleMockCreation(mock =>
    mock.with({
      permissions: { admin: true },
      entityUrn: this.companyUrn,
      followingInfo: mocker
        .mockPDSC('com.linkedin.voyager.common.FollowingInfo')
        .with({
          following: false,
          followerCount: 100,
        }),
    })
  )
);
