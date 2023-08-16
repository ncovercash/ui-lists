import ky from 'ky';

const kyMock = ky.create({
  prefixUrl: 'https://test.c',
});

jest.mock('@folio/stripes/core', () => {
  return {
    IfInterface: jest.fn(({ name, children }) => {
      return name === 'interface' ? children : null;
    }),
    IfPermission: jest.fn(({ perm, children }) => {
      return perm === 'permission' ? children : null;
    }),
    Pluggable: jest.fn(({ children }) => [children]),
    AppIcon: jest.fn(({ ariaLabel }) => <span>{ariaLabel}</span>),
    useOkapiKy: () => kyMock
  };
});
