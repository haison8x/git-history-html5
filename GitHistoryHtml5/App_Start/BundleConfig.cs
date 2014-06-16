using System.Web.Optimization;

namespace GitHistoryHtml5
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/scripts").Include(
                        "~/scripts/jquery-1.11.1.js",
                        "~/scripts/createjs.js",
                        "~/scripts/githistorygraph.js"));


            RegisterLessBundles(bundles);
        }
   
        private static void RegisterLessBundles(BundleCollection bundles)
        {
            var lessBundle = new LessBundle("~/less/site")
                                .Include("~/content/bootstrap/less/bootstrap.less");
            bundles.Add(lessBundle);
        }
    }
}