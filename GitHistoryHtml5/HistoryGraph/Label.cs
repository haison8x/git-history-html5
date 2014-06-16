// --------------------------------------------------------------------------
// <copyright file="Label.cs" company="Nexcel Solutions Vietnam">
// Copyright (c) Nexcel Solutions Vietnam. All rights reserved.
// </copyright>
// --------------------------------------------------------------------------

namespace GitHistoryHtml5.HistoryGraph
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;

    /// <summary>
    /// Label class contains information of GIT label.
    /// </summary>
    public class Label
    {
        public string LabelState { get; set; }

        public int X { get; set; }

        public int Y { get; set; }

        public string Text { get; set; }
    }
}
