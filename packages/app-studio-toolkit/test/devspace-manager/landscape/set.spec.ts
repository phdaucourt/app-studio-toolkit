import { expect } from "chai";
import { SinonMock, mock } from "sinon";
import proxyquire from "proxyquire";
import * as land from "../../../src/devspace-manager/landscape/set";
import { LandscapeConfig } from "src/devspace-manager/landscape/landscape";

describe("landscapes set unit test", () => {
  let lands: LandscapeConfig[] = [];
  let cmdLandscapeSetProxy: typeof land.cmdLandscapeSet;
  const proxyWindow = {
    showInputBox: () => {
      throw new Error("not implemented");
    },
  };
  const proxyCommands = {
    executeCommand: () => {
      throw new Error("not implemented");
    },
  };
  const landscapeProxy = {
    getLanscapesConfig: (): LandscapeConfig[] => {
      return lands;
    },
    updateLandscapesConfig: (other: LandscapeConfig[]) => {
      lands = other;
    },
  };

  before(() => {
    cmdLandscapeSetProxy = proxyquire(
      "../../../src/devspace-manager/landscape/set",
      {
        "./landscape": landscapeProxy,
        vscode: {
          window: proxyWindow,
          commands: proxyCommands,
          "@noCallThru": true,
        },
      }
    ).cmdLandscapeSet;
  });

  let mockCommands: SinonMock;
  let mockWindow: SinonMock;
  beforeEach(() => {
    mockCommands = mock(proxyCommands);
    mockWindow = mock(proxyWindow);
  });

  afterEach(() => {
    mockCommands.verify();
    mockWindow.verify();
    lands = [];
  });

  const landscape = `https://my.landscape-1.com`;
  const alias = "landscape1";
  const emptyAlias = "";

  it("cmdLandscapeSet, confirmed, added, with alias", async () => {
    mockWindow.expects("showInputBox").atLeast(1).returns(landscape);
    mockWindow.expects("showInputBox").atLeast(1).returns(alias);
    mockCommands
      .expects("executeCommand")
      .withExactArgs("local-extension.tree.refresh")
      .resolves();
    await cmdLandscapeSetProxy();
    expect(lands.find((land) => land.url === landscape && land.alias === alias))
      .to.be.not.undefined;
    expect(lands.length).to.be.equal(1);
  });

  it("cmdLandscapeSet, confirmed added, without alias", async () => {
    mockWindow.expects("showInputBox").atLeast(1).returns(landscape);
    mockWindow.expects("showInputBox").atLeast(1).returns(emptyAlias);
    mockCommands
      .expects("executeCommand")
      .withExactArgs("local-extension.tree.refresh")
      .resolves();
    await cmdLandscapeSetProxy();
    expect(
      lands.find((land) => land.url === landscape && land.alias === emptyAlias)
    ).to.be.not.undefined;
    expect(lands.length).to.be.equal(1);
  });

  it("cmdLandscapeSet, confirmed added, alias canceled", async () => {
    mockWindow.expects("showInputBox").atLeast(1).returns(landscape);
    mockWindow.expects("showInputBox").atLeast(1).returns(undefined);
    mockCommands
      .expects("executeCommand")
      .withExactArgs("local-extension.tree.refresh")
      .resolves();
    await cmdLandscapeSetProxy();
    expect(
      lands.find((land) => land.url === landscape && land.alias === emptyAlias)
    ).to.be.not.undefined;
    expect(lands.length).to.be.equal(1);
  });

  it("cmdLandscapeSet, confirmed, existed, with alias", async () => {
    lands.push({ url: landscape, alias: alias });
    mockWindow.expects("showInputBox").atLeast(1).returns(landscape);
    mockWindow.expects("showInputBox").atLeast(1).returns(alias);
    mockCommands
      .expects("executeCommand")
      .withExactArgs("local-extension.tree.refresh")
      .resolves();
    await cmdLandscapeSetProxy();
    expect(lands.find((land) => land.url === landscape && land.alias === alias))
      .to.be.not.undefined;
    expect(lands.length).to.be.equal(1);
  });

  it("cmdLandscapeSet, confirmed, existed, without alias", async () => {
    lands.push({ url: landscape, alias: emptyAlias });
    mockWindow.expects("showInputBox").atLeast(1).returns(landscape);
    mockWindow.expects("showInputBox").atLeast(1).returns(emptyAlias);
    mockCommands
      .expects("executeCommand")
      .withExactArgs("local-extension.tree.refresh")
      .resolves();
    await cmdLandscapeSetProxy();
    expect(
      lands.find((land) => land.url === landscape && land.alias === emptyAlias)
    ).to.be.not.undefined;
    expect(lands.length).to.be.equal(1);
  });

  it("cmdLandscapeSet, confirmed, existed, alias canceled", async () => {
    lands.push({ url: landscape, alias: emptyAlias });
    mockWindow.expects("showInputBox").atLeast(1).returns(landscape);
    mockWindow.expects("showInputBox").atLeast(1).returns(undefined);
    mockCommands
      .expects("executeCommand")
      .withExactArgs("local-extension.tree.refresh")
      .resolves();
    await cmdLandscapeSetProxy();
    expect(
      lands.find((land) => land.url === landscape && land.alias === emptyAlias)
    ).to.be.not.undefined;
    expect(lands.length).to.be.equal(1);
  });

  it("cmdLandscapeSet, canceled", async () => {
    mockWindow.expects("showInputBox").returns(undefined);
    mockCommands.expects("executeCommand").never();
    await cmdLandscapeSetProxy();
    expect(lands.find((land) => land.url === landscape)).to.be.undefined;
  });
});
