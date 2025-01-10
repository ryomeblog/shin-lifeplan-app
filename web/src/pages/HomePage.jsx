import React from "react";
import {
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  Box,
  Avatar,
  Fab,
  Container,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getStyles, getTitleDecorations } from "../assets/styles/modeStyles";
import AddIcon from "@mui/icons-material/Add";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ShareIcon from "@mui/icons-material/Share";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const sampleLifePlans = [
  {
    id: 1,
    name: "30代ライフプラン",
    inflationRate: 2.5,
    likes: 24,
    shares: 5,
  },
  {
    id: 2,
    name: "40代資産形成計画",
    inflationRate: 2.0,
    likes: 16,
    shares: 3,
  },
];

function HomePage({ mode = "simple" }) {
  const navigate = useNavigate();
  const styles = getStyles(mode);

  const handleCreateNewPlan = () => {
    navigate("/create-life-plan");
  };

  const handleSelectPlan = (planId) => {
    console.log(`Selected Plan ID: ${planId}`);
  };

  return (
    <Box sx={styles.container}>
      <Container maxWidth="md">
        <Typography
          variant="h4"
          sx={{
            ...styles.title,
            fontSize: "2rem",
            marginBottom: "2rem",
            fontWeight: 600,
          }}
        >
          {getTitleDecorations(mode)[0]}ライフプラン一覧
          {getTitleDecorations(mode)[1]}
        </Typography>

        <Grid container spacing={3}>
          {sampleLifePlans.map((plan) => (
            <Grid item xs={12} key={plan.id}>
              <Card
                sx={{
                  ...styles.paper,
                  transition: "transform 0.2s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: styles.button.backgroundColor,
                        width: 40,
                        height: 40,
                      }}
                    >
                      {plan.name[0]}
                    </Avatar>
                    <Box sx={{ ml: 2, flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: 600, color: styles.title.color }}
                      >
                        {plan.name}
                      </Typography>
                    </Box>
                    <IconButton>
                      <MoreVertIcon sx={{ color: styles.iconButton.color }} />
                    </IconButton>
                  </Box>

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: styles.container.backgroundColor,
                      borderRadius: 1,
                      mb: 2,
                    }}
                  >
                    <Typography sx={{ color: styles.subTitle.color }}>
                      インフレ率: {plan.inflationRate}%
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <IconButton sx={styles.iconButton}>
                      <FavoriteIcon />
                      <Typography sx={{ ml: 1 }}>{plan.likes}</Typography>
                    </IconButton>
                    <IconButton sx={styles.iconButton}>
                      <ShareIcon />
                      <Typography sx={{ ml: 1 }}>{plan.shares}</Typography>
                    </IconButton>
                  </Box>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    variant="contained"
                    sx={styles.button}
                    onClick={() => handleSelectPlan(plan.id)}
                  >
                    詳細
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Fab
          color="primary"
          sx={{
            ...styles.button,
            position: "fixed",
            bottom: 24,
            right: 24,
          }}
          onClick={handleCreateNewPlan}
        >
          <AddIcon />
        </Fab>
      </Container>
    </Box>
  );
}

export default HomePage;