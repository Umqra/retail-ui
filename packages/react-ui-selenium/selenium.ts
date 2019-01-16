// import { Builder, WebDriver } from "selenium-webdriver";
import Mocha, {
  Suite,
  SuiteFunction,
  Func,
  AsyncFunc,
  Test,
  TestFunction,
  MochaGlobals
} from "mocha";
import { WebDriver } from "selenium-webdriver";

interface Config {
  gridUrl: string;
  hostUrl: string;
  browsers: { [key: string]: { browserName: string } };
}

const config: Config = {
  gridUrl: "http://screen-dbg:shot@grid.testkontur.ru/wd/hub",
  hostUrl: "http://10.4.0.17:6060/iframe.html",
  browsers: {
    chrome: { browserName: "chrome" },
    firefox: { browserName: "firefox" },
    ie11: { browserName: "internet explorer" }
  }
};

console.log("init");

interface MochaContext extends MochaGlobals {
  retries: (n: number) => void;
  browser: WebDriver;
}

function describeFactory(
  suites: Suite[],
  file: string,
  common: any
): SuiteFunction {
  function describe(title: string, fn: (this: Suite) => void): Suite {
    const [currentSuite] = suites;
    if (currentSuite.parent) {
      // create browser
      const kind = encodeURIComponent(currentSuite.parent.title);
      const story = encodeURIComponent(currentSuite.title);
      const storyPath = `?selectedKind=${kind}&selectedStory=${story}`;

      console.log(storyPath);
      // beforeEach() goto url
    }

    return common.suite.create({ title, file, fn });
  }
  function only(title: string, fn: (this: Suite) => void): Suite {
    return common.suite.only({ title, file, fn });
  }
  function skip(title: string, fn: (this: Suite) => void): Suite {
    return common.suite.skip({ title, file, fn });
  }
  // @ts-ignore
  describe.only = only;
  // @ts-ignore
  describe.skip = skip;

  return describe as SuiteFunction;
}

function itFactory(
  suites: Suite[],
  context: MochaContext,
  file: string,
  common: any
): TestFunction {
  function it(title: string, fn?: Func | AsyncFunc) {
    const [currentSuite] = suites;
    if (currentSuite.isPending()) {
      fn = undefined;
    }
    const test = new Test(title, fn);
    test.file = file;
    currentSuite.addTest(test);
    return test;
  }
  function only(title: string, fn: Func | AsyncFunc): Test {
    return common.test.only(mocha, context.it(title, fn));
  }
  function skip(title: string): Test {
    return context.it(title);
  }
  function retries(n: number): void {
    context.retries(n);
  }
  // @ts-ignore
  it.only = only;
  // @ts-ignore
  it.skip = skip;
  // @ts-ignore
  it.retries = retries;

  return it as TestFunction;
}

// @ts-ignore
module.exports = Mocha.interfaces.selenium = function seleniumInterface(
  suite: Suite
) {
  const suites = [suite];

  // Object.keys(config.browsers).forEach(browserName => {
  //   const browserSuite = new Suite(browserName, suite.ctx);
  //   const suites = [browserSuite];
  // });

  suite.on("pre-require", function preRequire(context, file, mocha) {
    const common = require("mocha/lib/interfaces/common")(
      suites,
      context,
      mocha
    );

    context.before = common.before;
    context.after = common.after;
    context.beforeEach = common.beforeEach;
    context.afterEach = common.afterEach;
    context.run = mocha.options.delay && common.runWithSuite(suite);

    context.describe = context.context = describeFactory(suites, file, common);
    context.xdescribe = context.xcontext = context.describe.skip;

    // @ts-ignore
    context.it = context.specify = itFactory(suites, context, file, common);
    context.xit = context.xspecify = context.it.skip;
  });
};

// Redifine BDD
// @ts-ignore
// module.exports = Mocha.interfaces.selenium = function seleniumInterface(suite: Suite) {
//   console.log("suite");

//   const browsers: Array<{ name: string; browser: WebDriver }> = [];

//   suite.beforeAll(async () => {
//     console.log("beforeAll");
//     // tslint:disable-next-line: forin
//     for (const name in config.browsers) {
//       const browser = await new Builder()
//         .usingServer(config.gridUrl)
//         .withCapabilities(config.browsers[name])
//         .build();
//       browsers.push({ name, browser });
//     }
//   });

//   suite.on("pre-require", context => {
//     console.log("pre-require");
//     const { describe } = context;
//     // @ts-ignore
//     context.describe = function(title: string, fn: (this: Suite) => void) {
//       console.log("describe", arguments[0]);

//       return (describe as SuiteFunction).call(this, title, fn);
//     };
//   });
// };

// browsers
// parallel
// TODO react-selenium-testing

// simple API
/*

describe("Button", () => {
  describe("Story", browser => {
    it("scenario", () => {
      // click
      // hover
      // type
    });

    it("idle", () => {
      browser
        .getElement("#test-element")
        .capture("hover", { ignore: "loader" })
        .capture("click", '[class^="123"]')
        .capture("type", "1234") // type 1
        .capture("type", "1234"); // type 2
    });

    it("");
  });
});

*/

// Draft

/*
class Browser {
  constructor(config) {
    this.config = config;
    this.context = [];
  }

  async setStory(story) {
    this.driver = await new Builder()
      .usingServer(this.config.gridUrl)
      .withCapabilities(this.config.capabilities)
      .build();
    await this.driver.get(
      this.config.hostUrl +
        `?selectedKind=${this.config.kind}&selectedStory=${story}`
    );
  }

  getElement(selector) {
    this.queue.push({
      selector: [...(this.queue.slice(-1)[0].selector || []), selector]
    });
    this.context.push(selector);
    return this;
  }

  async flush() {}
}
*/

/*
const { describe, it } = context;

    context.describe = function(title, fn) {
      describe.call(this, title, async function() {
        if (fn.length == 1) {
          if (!this.browser) {
            throw new Error("You can't use `browser` on root level describe");
          }
          await this.browser.setStory(title);

          return fn.call(this, this.browser);
        }
        this.browser = new Browser({ ...config, kind: title });
        return fn.call(this);
      });
    };

    context.it = function(title, fn) {
      it.call(this, title, async function() {
        fn.call(this);

        await browser.flush();
      });
    };
    */
