using System.Web.Mvc;
using NGit.Revplot;
using System.Configuration;
using NGit.Api;
using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace GitHistoryHtml5.Controllers
{
    public class HomeController : Controller
    {
        private string GitWorkingDirectory = ConfigurationManager.AppSettings["GitWorkingDirectory"];

        public ActionResult Index()
        {
            var commits = GetAlltCommits();
            var plotRenderer = new SimplePlotRenderer();
            var historyGraph= plotRenderer.BuildGraph(commits);

            ViewBag.HistoryGraph = JsonConvert.SerializeObject(historyGraph);                
            return View();
        }

        private PlotCommitList<PlotLane> GetAlltCommits()
        {
            var workingDirectoryPath = new Sharpen.FilePath(GitWorkingDirectory);
            var git = Git.Open(workingDirectoryPath);
            var repository = git.GetRepository();

            try
            {
                var plotWalk = new PlotWalk(repository);
                var refsByPeeledList = repository.GetAllRefsByPeeledObjectId();
                var revCommitList = refsByPeeledList
                                    .Keys
                                    .Select(id => plotWalk.ParseCommit(id))
                                    .ToList();

                plotWalk.MarkStart(revCommitList);

                var commits = new PlotCommitList<PlotLane>();
                commits.Source(plotWalk);
                commits.FillTo(int.MaxValue);

                return commits;
            }
            finally
            {
                git.GetRepository().Close();
                git.GetRepository().ObjectDatabase.Close();
            }
        }
    }
}
