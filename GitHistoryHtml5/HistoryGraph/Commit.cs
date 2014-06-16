// --------------------------------------------------------------------------
// <copyright file="Commit.cs" company="Nexcel Solutions Vietnam">
// Copyright (c) Nexcel Solutions Vietnam. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------

namespace GitHistoryHtml5.HistoryGraph
{
    /// <summary>
    /// CommitDot class.
    /// </summary>
    public class Commit
    {
        public string CommitHash { get; set; }

        public string CommitMessage { get; set; }

        public string CommitState { get; set; }

        public int X { get; set; }

        public int Y { get; set; }
    }
}
