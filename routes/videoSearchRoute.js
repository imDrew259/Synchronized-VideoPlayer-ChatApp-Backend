import * as yt from 'youtube-search-without-api-key';

const videos = async (req,res)=>{
    try {
        let videoList = await yt.search(req.body.word);
        res.status(200).json({ videoList });
    }
    catch {
        console.log(error);
    }
}

export default videos;